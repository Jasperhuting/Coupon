/* eslint-disable max-len */

import * as admin from "firebase-admin";
import {checkIfExpired1} from "./checkIfExpired";
import {sendMailIfInside7Days1} from "./checkIfInside7Days";
import {sendEveryMonthAMail1} from "./sendEveryMonthAMail";

admin.initializeApp();

checkIfExpired1;
sendMailIfInside7Days1;
sendEveryMonthAMail1;
