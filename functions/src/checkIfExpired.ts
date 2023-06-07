import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();


export const checkIfExpired = exports.checkIfExpired = functions.pubsub
  .schedule("every day").onRun(async () => {
    await admin.firestore()
      .collection("giftcards").get().then((res) => {
        res.docs.forEach((doc) => {
          const dateInTime = new Date(doc.data().validDate).getTime();
          const todayInTime = new Date().getTime();

          if (dateInTime < todayInTime) {
            if (doc.data().status !== "DELETED") {
              const docRef = admin.firestore()
                .collection("giftcards").doc(doc.id);
              docRef.update({status: "EXPIRED"});
            }
          }
        });
      });
  });
