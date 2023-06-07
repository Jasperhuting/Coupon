import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {createTransport} from "nodemailer";


type Users = {
  uid: string;
  data: Giftcards[];
  email: string;
}

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
  remaining?: number;
  validDate?: string;
  owner?: string;
  id: string;
  status: Status;
}

const {useremail, pass} = functions.config().gmail;

export const sendEveryMonthAMail =
  exports.sendEveryMonthaMail = functions.region("us-central1").pubsub
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

        const dataItems = user.data
          .filter(
            (d) => !["EXPIRED", "DELETED", "USED"].includes(d.status))
          .filter(
            (d) => d.remaining && d.remaining > 0);

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

          const day = datum.getDate();
          const month = datum.getMonth() + 1;
          const year = datum.getFullYear();

          if (datum >= today) {
            const parsedDate = data.validDate ?
              `(${day}-${month}-${year})` :
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
              functions.logger.info(`mail error ${error}`,
                {structuredData: true});
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });
        }
      });
    });
