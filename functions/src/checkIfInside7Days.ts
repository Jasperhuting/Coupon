import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {createTransport} from "nodemailer";

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

export const sendMailIfInside7Days =
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

        const dataItems = user.data
          .filter(
            (d: Giftcards) => !["EXPIRED", "DELETED", "USED"]
              .includes(d.status))
          .filter(
            (d: Giftcards) => d.remaining && d.remaining > 0);

        dataItems.forEach((data: any) => {
          const date = new Date(data.validDate);
          const today = new Date();
          const _today = new Date();
          const todayPlusSevenDays = new Date(
            _today.setDate(today.getDate() + 7));

          const statusArray = ["EXPIRED", "USED", "DELETED"];

          if (
            date <= todayPlusSevenDays &&
            date >= today &&
            !statusArray.includes(data.status) &&
            data.remaining > 0
          ) {
            counter += 1;
            dataList += `
          <b>${data.name}</b>
          ${data.amount} euro
          (${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()})
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
          transporter.sendMail(mailOptions, (error: any, info: any) => {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });
        }
      });
    });
