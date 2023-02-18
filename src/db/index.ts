
import { initializeApp } from 'firebase/app';


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBzeqw8ClgMucvzkGOTatEJ4gTb6r6Ig9Q",
    authDomain: "coupon-reminder.firebaseapp.com",
    databaseURL: "https://coupon-reminder.firebaseio.com",
    projectId: "coupon-reminder",
    storageBucket: "coupon-reminder.appspot.com",
    messagingSenderId: "734528841100",
    appId: "1:734528841100:web:2acde953618a5dcd"
};

const app = initializeApp(firebaseConfig);


// init app
export default app

