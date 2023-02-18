import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();


// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.scheduledFunction = functions.pubsub
  .schedule("@monthluy").onRun(() => {
    admin
      .firestore()
      .collection("mail")
      .add({
        to: "jasperhuting+test@gmail.com",
        message: {
          subject: "Hello from Firebase!",
          text: "This is the plaintext section of the email body.",
          html: "This is the <code>HTML</code> section of the email body.",
        },
      })
      .then(() => {
        console.log("Queued email for delivery!");
      });
  });
