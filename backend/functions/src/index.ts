import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {createTransport} from "nodemailer";


admin.initializeApp();

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript

// exports.getData = functions
//   .region("europe-west1")
//   .pubsub
//   .schedule("@monthluy")
//   .onRun(() => {

//     functions.database.ref('giftcards')

// });

exports.sendMail = functions.https.onRequest((req, response) => {
  const transporter = createTransport({
    service: "gmail",
    port: 465,
    auth: {
      user: "jasper.huting@gmail.com", // generated ethereal user
      pass: "wuofjlcaprcrnyre", // generated ethereal password
    },
  });

  console.log(transporter);


  // const mailOptions = {
  //   from: "jasperhuting@gmail.com",
  //   to: "jasper.huting@gmail.com",
  //   subject: "Coupon reminder",
  //   html: "dit is een test",
  // };

  // transporter.sendMail(mailOptions,
  //   (error: Error | null, info: any) => {
  //     console.log(error);
  //     response.send("Email sent: " + info.response);
  //   });

  response.send("kom je hier?");
});


exports.sendMonthlyMail = functions.https.onRequest(async (req, response) => {
  // const giftcards = [] as any;

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
        const user = users.find((user: any) => user.uid === doc.data().owner);
        if (user) {
          user.data.push(doc.data());
        }
      });
    });


  users.forEach((user: any) => {
    let dataList = "";
    user.data.forEach((data: any) => {
      dataList += `${data.name} ${data.amount} ${data.validDate}`;
    });

    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   port: 465,
    //   auth: {
    //     user: "jasper.huting@gmail.com", // generated ethereal user
    //     pass: "wuofjlcaprcrnyre", // generated ethereal password
    //   },
    // });


    // const mailOptions = {
    //   from: "jasperhuting@gmail.com",
    //   to: user.email,
    //   subject: "Happy birthday to ?",
    //   html: dataList,
    // };

    // transporter.sendMail(mailOptions, function(error: any, info: any) {
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     console.log("Email sent: " + info.response);
    //   }
    // });

    admin
      .firestore()
      .collection("mail")
      .add({
        to: user.email,
        message: {
          subject: "Hello from CouponReminder",
          text: "This is the plaintext section of the email body.",
          html: dataList,
        },
      });
  });

  response.send(users);

  // // const users = [] as any;

  // await admin.firestore().collection("giftcards").get().then((res) => {
  //   const giftcardsByUser = [] as any;


  //   const giftcardsByUserPromise = new Promise((resolve, reject) => {
  //     res.docs.forEach((doc, index) => {
  //       if (!giftcardsByUser[doc.id]) {
  //         giftcardsByUser[doc.id] = [];
  //       }
  //       giftcardsByUser[doc.id].push(doc.data());
  //       if (index === res.docs.length -1) resolve(true);
  //     });
  //   });

  //   giftcardsByUserPromise.then(() => {
  //     response.send(giftcardsByUser);
  //   });
  // });


  // await admin.firestore()
  //   .collection("users").get().then((res) => {
  //     res.docs.map((doc) => {
  //       users.push(doc.data());
  //     });
  //   });
});


exports.getData = functions.https.onRequest(async (req, response) => {
  const users = [] as any;

  await admin.firestore()
    .collection("users").get().then((res) => {
      res.docs.map((doc) => {
        users.push(doc.data());
      });
    });
  response.send(users);
});

// auth trigger (new user signup)
exports.newUserSignUp = functions.auth.user().onCreate((user) => {
  // for background triggers you must return a value/promise
  return admin.firestore().collection("users").doc(user.uid).set({
    email: user.email,
    name: user.displayName,
  });
});


// auth trigger (user deleted)
exports.userDeleted = functions.auth.user().onDelete((user) => {
  const doc = admin.firestore().collection("users").doc(user.uid);
  return doc.delete();
});


// exports.scheduledFunction = functions
//   .pubsub
//   .schedule("@monthluy")
//   .onRun(() => {
//     admin
//       .firestore()
//       .collection("mail")
//       .add({
//         to: "jasperhuting+test@gmail.com",
//         message: {
//           subject: "Hello from Firebase!",
//           text: "This is the plaintext section of the email body.",
//           html: "This is the <code>HTML</code> section of the email body.",
//         },
//       })
//       .then(() => {
//         console.log("Queued email for delivery!");
//       });
//   });


// http callable function (adding a request)
exports.addRequest = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Alleen ingelogde gebruikers kunnen een cadeaubon toevoegen"
    );
  }
  // const amount = data.amount;
  // if (Number(amount) > 0) {
  //   throw new functions.https.HttpsError(
  //     "invalid-argument",
  //     "Bedrag moet meer dan 0 karakters zijn"
  //   );
  // }

  console.log("context.auth.uid", context.auth.uid);

  return admin.firestore().collection("giftcards").add({
    name: data.name,
    amount: String(data.amount),
    owner: context.auth.uid,
    validDate: data.validDate,
  });
});
