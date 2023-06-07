/* eslint-disable max-len */

import * as admin from "firebase-admin";
import {checkIfExpired} from "./checkIfExpired";
import {sendMailIfInside7Days} from "./checkIfInside7Days";
import {sendEveryMonthAMail} from "./sendEveryMonthAMail";

admin.initializeApp();

checkIfExpired;
sendMailIfInside7Days;
sendEveryMonthAMail;
