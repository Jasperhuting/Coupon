const admin = require("firebase-admin");
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./coupon-reminder-firebase-adminsdk-dpmk1-e53ba681cf.json');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://coupon-reminder.firebaseio.com"
});

const db = getFirestore();

const emailaddresses = {
  lisanne: 'lisannedriessen@gmail.com',
  jasper: 'jasper.huting@gmail.com'
}


const getGiftCards = async () => {

  const giftcards = await db.collection('giftcards').get();

  const subject = `let op❗️ je hebt (${giftcards.length}) cadeaubonnen die gaan verlopen`;
  let text = '';
  let email = '';
  giftcards.forEach((doc) => {
    const owner = doc.data().owner;
    email = emailaddresses[owner.toLowerCase()];
    text += `${doc.data().name} ter waarde van ${doc.data().amount} euro`;
  })

  main(email, text, subject).catch(console.error);

}

getGiftCards();

const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
async function main(email, text, subject) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    auth: {
      user: "jasper.huting@gmail.com", // generated ethereal user
      pass: "wuofjlcaprcrnyre", // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Het cadeaubonnen spook 👻" <jasper.huting+giftcard@gmail.com>', // sender address
    to: email, // list of receivers
    subject: subject, // Subject line
    text: text, // plain text body
    html: text, // html body
  });

  console.log("Message sent: %s", info.messageId);
}
