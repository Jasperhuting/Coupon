/* eslint-disable max-len */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {createTransport} from "nodemailer";

admin.initializeApp();

const {useremail, pass} = functions.config().gmail;

enum Status {
  NEW = "NEW",
  DEFAULT = "DEFAULT",
  USED = "USED",
  DELETED = "DELETED",
  EXPIRED = "EXPIRED",
}

type Giftcards = {
  name?: string;
  amount?: number;
  validDate?: string;
  owner?: string;
  id: string;
  status: Status;
}

type Users = {
  uid: string;
  data: Giftcards[];
  email: string;
}

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((_, response) => {
  response.send("Mail verzonden vanaf functions!");
});


exports.checkIfExpired = functions.pubsub
  .schedule("every day").onRun(async () => {
    await admin.firestore()
      .collection("giftcards").get().then((res) => {
        res.docs.forEach((doc) => {
          const dateInTime = new Date(doc.data().validDate).getTime();
          const todayInTime = new Date().getTime();

          if (dateInTime < todayInTime) {
            const docRef = admin.firestore()
              .collection("giftcards").doc(doc.id);
            docRef.update({status: "EXPIRED"});
          }
        });
      });
  });


exports.sendMailIfInside7Days = functions.region("us-central1").pubsub
  .schedule("every day 09:00").timeZone("UTC").onRun(async () => {
    const users = [] as any;

    await admin.firestore()
      .collection("users").get().then((res) => {
        res.docs.map((doc) => {
          users.push({...doc.data(), data: []});
        });
      });

    await admin.firestore()
      .collection("giftcards").get().then((res) => {
        res.docs.map((doc) => {
          const user = users
            .find((user: any) => user.uid === doc.data().owner);
          if (user) {
            user.data.push(doc.data());
          }
        });
      });

    users.forEach((user: any) => {
      let dataList = "";
      let counter = 0;

      // const dataItems = user.data;

      user.data.forEach((data: any) => {
        const date = new Date(data.validDate);
        const today = new Date();
        const _today = new Date();
        const todayPlusSevenDays = new Date(_today.setDate(today.getDate() + 7));

        functions.logger.info(`todayPlusSevenDays ${todayPlusSevenDays}`, {structuredData: true});
        functions.logger.info(`date ${date}`, {structuredData: true});
        functions.logger.info(`today ${new Date()}`, {structuredData: true});
        functions.logger.info(`date <= todayPlusSevenDays ${date <= todayPlusSevenDays}`, {structuredData: true});
        functions.logger.info(`date <= new Date() ${date <= new Date()}`, {structuredData: true});

        if (date <= todayPlusSevenDays && date >= today) {
          counter += 1;
          dataList += `
          <b>${data.name}</b>
          ${data.amount} euro
          (${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()})
          <br />`;
        }
      });


      const transporter = createTransport({
        service: "Gmail",
        port: 465,
        secure: true,
        auth: {
          user: useremail, // generated ethereal user
          pass, // generated ethereal password
        },
      });


      const mailOptions = {
        from: "jasperhuting@gmail.com",
        to: user.email,
        subject: `Je hebt nog ${counter}
      ${counter > 1 ? "cadeaubonnen" : "cadeaubon"}
      die je kunt verzilveren`,
        html: dataList,
      };

      if (counter > 0) {
        console.log("none");
        transporter.sendMail(mailOptions, function(error: any, info: any) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      }
    });
  });


exports.sendEveryMonthaMail = functions.pubsub
  .schedule("0 9 1 * *").timeZone("UTC").onRun(async () => {
    functions.logger.info("Hello logs!", {structuredData: true});

    const users = [] as any;

    await admin.firestore()
      .collection("users").get().then((res) => {
        res.docs.map((doc) => {
          users.push({...doc.data(), data: []});
        });
      });

    await admin.firestore()
      .collection("giftcards").get().then((res) => {
        res.docs.map((doc) => {
          const user = users
            .find((user: Users) => user.uid === doc.data().owner);
          if (user) {
            user.data.push(doc.data());
          }
        });
      });

    functions.logger
      .info(`users length ${users.length}`, {structuredData: true});

    users.forEach((user: Users) => {
      let dataList = "";

      const dataItems = user.data;

      user.data.sort((a: Giftcards, b: Giftcards) => {
        if (!Date.parse(a.validDate!)) {
          return 1;
        }
        if (!Date.parse(b.validDate!)) {
          return -1;
        }
        // Convert the date strings to Date objects and compare them
        const dateA = new Date(a.validDate!);
        const dateB = new Date(b.validDate!);
        if (dateA < dateB) {
          return -1;
        }
        if (dateA > dateB) {
          return 1;
        }
        return 0;
      }).forEach((data: Giftcards) => {
        let datum = new Date();
        const today = new Date();

        if (data.validDate) {
          datum = new Date(data.validDate);
        }

        if (datum >= today) {
          const parsedDate = data.validDate ?
            `(${datum.getDate()}-${datum.getMonth()+1}-${datum.getFullYear()})` :
            "(geen verloopdatum)";

          dataList += `
          <b>${data.name}</b>
          ${data.amount} euro
          ${parsedDate}
          <br />`;
        }
      });

      const transporter = createTransport({
        service: "Gmail",
        port: 465,
        secure: true,
        auth: {
          user: useremail, // generated ethereal user
          pass, // generated ethereal password
        },
      });


      const mailOptions = {
        from: "jasperhuting@gmail.com",
        to: user.email,
        // eslint-disable-next-line max-len
        subject: `Je hebt nog ${dataItems.length} ${dataItems.length > 1 ? "cadeaubonnen" : "cadeaubon"} die je kunt verzilveren`,
        html: dataList,
      };

      if (dataItems.length > 0) {
        transporter.sendMail(mailOptions, (error: any, info: any) => {
          if (error) {
            functions.logger.info(`mail error ${error}`, {structuredData: true});
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      }
    });
  });

