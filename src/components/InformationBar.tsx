import db from "db";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import { getCurrentUser } from "firestore";
import { useEffect, useState } from "react";

type InformationProps = {
    amountGiftcards: number;
    totalAmount: number;
    userInfo: any;
    triggerReload: () => void;
}

export const InformationBar = ({ amountGiftcards, totalAmount, userInfo, triggerReload }: InformationProps) => {

    
    const firestore = getFirestore(db)


      const setHideDeletedDB = (hideDeleted: boolean) => {
        if (userInfo && userInfo.id) {
        const docRef = doc(firestore, "users", userInfo.id);

        updateDoc(docRef, {
            hideDeleted: hideDeleted,
        }).then(() => {
            console.log('succesvol aangepast');
        }).catch((e) => {
            console.log(e, 'er is iets fout gegaan');
        }).finally(() => {
            triggerReload();
        })
      }
    }

    const setHideExpireddDB = (hideExpired: boolean) => {
        if (userInfo && userInfo.id) {
        const docRef = doc(firestore, "users", userInfo.id);

        updateDoc(docRef, {
            hideExpired: hideExpired,
        }).then(() => {
            console.log('succesvol aangepast');
        }).catch((e) => {
            console.log(e, 'er is iets fout gegaan');
        }).finally(() => {
            triggerReload();
        })
      }
    }



    const changeHideDeleted = () => {
        console.log('kom je hier?')
        setHideDeletedDB(!Boolean(userInfo.hideDeleted))
        triggerReload();
    }
    const changeHideExpired = () => {
        console.log('kom je hier?')
        setHideExpireddDB(!Boolean(userInfo.hideExpired))
        triggerReload();
    }
    

    return <>
        <h1>({amountGiftcards}) Giftcards, totaal: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(totalAmount)}</h1>
        <span>
            verberg verwijderde cadeaubonnen <button onClick={() => changeHideDeleted()}>{userInfo && Boolean(userInfo.hideDeleted).toString()}</button>
            verberg verlopen cadeaubonnen <button onClick={() => changeHideExpired()}>{userInfo && Boolean(userInfo.hideExpired).toString()}</button>
        </span>
    </>
}
