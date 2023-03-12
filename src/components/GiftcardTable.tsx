import styled from "styled-components/macro"
import { Status, Giftcard } from "../types";
import { Column, StyledColumn } from './column';
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import db from '../db/index';
import { store } from "App";
import { FontAwesomeIcon, } from "@fortawesome/react-fontawesome";
import { faCalendarXmark, faCheckCircle, faGift, faRocket, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";


const months = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];

const StatusTranslation = (status: Status | undefined) => {
    if (status === Status.NEW) {
        return {
            icon: <FontAwesomeIcon icon={faRocket} />,
            text: 'Nieuw'
        }
    }
    if (status === Status.USED) {
        return {
            icon: <FontAwesomeIcon icon={faGift} />,
            text: 'Gebruikt'
        }
    }
    if (status === Status.DEFAULT) {
        return {
            icon: <FontAwesomeIcon icon={faCheckCircle} />,
            text: 'Geldig'
        }
    }
    if (status === Status.EXPIRED) {
        return {
            icon: <FontAwesomeIcon icon={faCalendarXmark} />,
            text: 'Verlopen'
        }
    }
    if (status === Status.DELETED) {
        return {
            icon: <FontAwesomeIcon icon={faTrash} />,
            text: 'Verwijderd'
        }
    }
    if (!status) {
        return {
            text: ''
        }
    }
}


const giftcardDate = (giftcardDate: string | undefined) => {
    if (giftcardDate === null || !giftcardDate || giftcardDate === 'Invalid Date') {
        return 'Geen einddata';
    }
    const date = new Date(giftcardDate);
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}




const GiftCardbutton = styled.button`
      padding: 10px;
      background-color: white;
      box-sizing: border-box;
      display: block;
      border: 1px solid #e5e5e5;
      border-radius: 4px;
      &:not(:disabled) {
        cursor: pointer;
      }

      &:not(:disabled):hover {
        background-color: #e5e5e5;
      }
`

const GiftCardRow = styled.div<{ extra?: boolean, endrow?: boolean, sort?: string }>`  
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 1px;
    border-bottom: 1px solid #2b3446;    
    margin-bottom: 1px;
    border-left: 1px solid #e5e5e5;
    border-right: 1px solid #e5e5e5;
    box-sizing: border-box;
     
    ${StyledColumn} {
      &:nth-child(1) {
      justify-content: center;
      align-items: flex-start;
      padding-left: 20px;
      }
   }
   ${StyledColumn} {
      &:nth-child(2) {
      align-items: center;
      padding-left: 20px;
      }
   }

   background-color: ${props => props.endrow ? '#000' : ''};
   ${StyledColumn} {
      background-color: ${props => props.endrow ? '#000 !important' : ''};
      color: ${props => props.endrow ? '#fff !important' : ''};
      margin-top: ${props => props.endrow ? '-2px' : '0'};

   }

   position: ${props => props.endrow ? 'sticky' : 'relative'};
   bottom: ${props => props.endrow ? '0' : 'auto'};
`

const GiftCard = styled.div<{ extra?: boolean }>`
width: 100%;

&:nth-child(even) {
  ${GiftCardRow} {
          ${StyledColumn} {
    background-color: ${props => !props.extra && '#eee'};
   }
  }
}

  
`
const Small = styled.span`
    font-size: 11px;
`
const TableHeader = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 1px;
  margin-bottom: 2px;

  ${StyledColumn} {
    background-color: #2b3446;
    color: white;

    &:nth-child(2) {      
      justify-content: center;
      align-items: center;
      padding-left: 20px;
    }

    &:nth-child(1) {
      border-top-left-radius: 4px;
      justify-content: flex-start;
      align-items: center;
      padding-left: 20px;
    }
    &:last-child {
      border-top-right-radius: 4px;
    }
  }
  
`
type Props = {
    defaultGiftcards: Giftcard[];
    expiredGiftcards: Giftcard[];
    newGiftcards: Giftcard[];
    deletedGiftcards: Giftcard[];
    usedGiftcards: Giftcard[];
    amountGiftcards: number;
    totalAmount: number;
    allData: Giftcard[];
    triggerReload: () => void;
}


export const GiftcardTable = ({ defaultGiftcards, expiredGiftcards, deletedGiftcards, usedGiftcards, newGiftcards, amountGiftcards, totalAmount, allData, triggerReload }: Props) => {

    const [user] = store.useState("user");
    const [filters] = store.useState("filters");
    const getExpired = window.sessionStorage.getItem('expired');
    const firestore = getFirestore(db)

    const setGiftcards = (sort: string, set: Giftcard[]) => {
        console.log('set', set);
        return set.map((giftcard: Giftcard) => {
            return <GiftCard key={giftcard.id} data-id={giftcard.id}>
                <GiftCardRow sort={sort}>
                    <Column row={true}>
                        <span>{giftcard.name}</span>
                        <span>{user.currentEmail === 'jasper.huting@gmail.com' && `(${giftcard.owner})`}</span>
                    </Column>
                    <Column>{giftcard.amount} euro</Column>
                    <Column row={true}>
                        {StatusTranslation(giftcard.status)?.icon}
                        <Small>{StatusTranslation(giftcard.status)?.text}</Small>
                    </Column>

                    <Column>{giftcardDate(giftcard.validDate)}</Column>
                    <Column row={false}>
                        <GiftCardbutton disabled={giftcard.status === Status.DELETED} onClick={() => deleteGiftcard(giftcard.id)} ><FontAwesomeIcon icon={faTrash} /></GiftCardbutton>


                        {giftcard.status === Status.USED && <GiftCardbutton onClick={() => setGiftcardUsed(giftcard, false)}>Niet gebruikt</GiftCardbutton>}
                        {(giftcard.status === Status.DEFAULT || giftcard.status === Status.NEW) && <GiftCardbutton onClick={() => setGiftcardUsed(giftcard, true)}>Gebruikt</GiftCardbutton>}

                    </Column>
                </GiftCardRow>
            </GiftCard>
        })
    }

    const deleteGiftcard = (id: string) => {


        // if (currentEmail.includes('lisanne')) {
        //     document.querySelector(`[data-id="${id}"]`)?.classList.add('delete');

        //     const docRef = doc(firestore, "giftcards", id);
        //     deleteDoc(docRef).then(() => {
        //         console.log('succesvol verwijderd');
        //     }).catch(() => {
        //         console.log('er is iets fout gegaan');
        //     }).finally(() => {
        //         // fetchPost();
        //     })
        // }

        console.log('zet status verwijderd');

        const docRef = doc(firestore, "giftcards", id);

        updateDoc(docRef, {
            status: Status.DELETED,
        }).then(() => {
            console.log('succesvol aangepast');
        }).catch(() => {
            console.log('er is iets fout gegaan');
        }).finally(() => {
            triggerReload();
        })


    }


    const setGiftcardUsed = (giftcard: Giftcard, gebruikt: boolean) => {

        const docRef = doc(firestore, "giftcards", giftcard.id);

        updateDoc(docRef, {
            name: giftcard.name,
            owner: giftcard.owner,
            amount: giftcard.amount,
            validDate: giftcard.validDate,
            status: gebruikt ? Status.USED : Status.DEFAULT,
        }).then(() => {
            console.log('succesvol aangepast');
        }).catch(() => {
            console.log('er is iets fout gegaan');
        }).finally(() => {
            triggerReload();
        })

    }

    return <>
        <TableHeader>
            <Column>Naam</Column>
            <Column>Waarde</Column>
            <Column>Status</Column>
            <Column>Einddatum</Column>
            <Column>Acties</Column>
        </TableHeader>
        {getExpired}
        {newGiftcards && newGiftcards.length > 0 && setGiftcards('new', newGiftcards)}
        {console.log("newGiftcards", newGiftcards)}
        
        {defaultGiftcards && defaultGiftcards.length > 0 && setGiftcards('default', defaultGiftcards)}
        {console.log("defaultGiftcards", defaultGiftcards)}
        
        {usedGiftcards && usedGiftcards.length > 0 && setGiftcards('used', usedGiftcards)}
        {console.log("usedGiftcards", usedGiftcards)}
        
        {deletedGiftcards && deletedGiftcards.length > 0 && setGiftcards('deleted', deletedGiftcards)}
        {console.log("deletedGiftcards", deletedGiftcards)}

        {expiredGiftcards && expiredGiftcards.length > 0 && setGiftcards('expired', expiredGiftcards)}
        {/* {getExpired === 'true' && setGiftcards('expired', expiredGiftcards)} */}
        {console.log("expiredGiftcards", expiredGiftcards)}


        {allData.map((data) => {
            const date = new Date(data.validDate!);
            const today = new Date();
            const _today = new Date();
            const todayPlusSevenDays = new Date(_today.setDate(today.getDate() + 7));
            if (date <= todayPlusSevenDays && date >= today) {
            console.log(data.name);
            console.log({date});
            console.log({todayPlusSevenDays});
            console.log({today});
            return <>test</>
            } 
            return false;
        })}

        {/*  currentEmail === 'jasper.huting@gmail.com' */}
        <GiftCard key={allData.length + 1} data-id={allData.length + 1} extra={true}>
            <GiftCardRow endrow={true}>
                <Column>Totaal ({amountGiftcards})</Column>
                <Column>{totalAmount} euro</Column>
                <Column></Column>
                <Column></Column>
                <Column></Column>
            </GiftCardRow>
        </GiftCard>

    </>
}




