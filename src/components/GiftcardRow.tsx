import styled from "styled-components/macro"

import { FontAwesomeIcon, } from "@fortawesome/react-fontawesome";
import { faCalendarXmark, faCheckCircle, faGift, faRocket, faTrash, faCreditCard, faUndo } from "@fortawesome/free-solid-svg-icons";
import { Giftcard, Status } from "../types";
import { getFirestore, doc, updateDoc, query, getDocs } from "firebase/firestore";
import db from '../db/index';
import { Column, StyledColumn } from './column';
import { store } from "App";
import { useState } from "react";

const months = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];

const StatusTranslation = (status: Status | undefined) => {
    if (status === Status.NEW) {
        return {
            icon: <FontAwesomeIcon color="#FFC107" icon={faRocket} />,
            text: 'Nieuw',
            color: "#FFC107"
        }
    }
    if (status === Status.USED) {
        return {
            icon: <FontAwesomeIcon color="#03A9F4" icon={faGift} />,
            text: 'Gebruikt',
            color: "#03A9F4"
        }
    }
    if (status === Status.DEFAULT) {
        return {
            icon: <FontAwesomeIcon color="#4CAF50" icon={faCheckCircle} />,
            text: 'Geldig',
            color: "#4CAF50"
        }
    }
    if (status === Status.EXPIRED) {
        return {
            icon: <FontAwesomeIcon color="#FF5722" icon={faCalendarXmark} />,
            text: 'Verlopen',
            color: "#FF5722"
        }
    }
    if (status === Status.DELETED) {
        return {
            icon: <FontAwesomeIcon color="#9E9E9E" icon={faTrash} />,
            text: 'Verwijderd',
            color: "#9E9E9E"
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
        return 'Geen einddatum';
    }
    const date = new Date(giftcardDate);
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value)
}



const GiftCardbutton = styled.button`
      padding: 10px;
      background-color: white;
      box-sizing: border-box;
      display: block;
      border: 1px solid #e5e5e5;
      border-radius: 100%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      &:not(:disabled) {
        cursor: pointer;
      }

      &:not(:disabled):hover {
        background-color: #e5e5e5;
      }

      &.loading {
        background-color: #ff9900;
      }

`


const GiftCardbuttonText = styled.button`
      padding: 10px;
      background-color: white;
      box-sizing: border-box;
      display: block;
      border-radius: 4px;
      margin-left: 4px;
      border: 1px solid #e5e5e5;
      &:not(:disabled) {
        cursor: pointer;
      }

      &:not(:disabled):hover {
        background-color: #e5e5e5;
      }
`

const Small = styled.span<{ color?: string }>`
    color: ${props => props.color || 'black'};
    font-size: 11px;
`

const GiftCardRowStyled = styled.div<{ extra?: boolean, endrow?: boolean, sort?: string }>`  
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 1px;
    border-bottom: 1px solid #d6d7da;    
    margin-bottom: 1px;
    /* border-left: 1px solid #e5e5e5;
    border-right: 1px solid #e5e5e5; */
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

   ${StyledColumn} {
      background-color: ${props => props.endrow ? '#2b3446 !important' : ''};
      color: ${props => props.endrow ? '#fff !important' : ''};
      margin-top: ${props => props.endrow ? '-2px' : '0'};

   }

   position: ${props => props.endrow ? 'sticky' : 'relative'};
   bottom: ${props => props.endrow ? '0' : 'auto'};
`
const Amount = styled.div`
    position: absolute;
    bottom: 14px;
    right: 20px;
`
const TotalAmount = styled.div`    
    position: absolute;
    bottom: 3px;
    right: 20px;
    font-size: 10px;
    cursor: pointer;
`

const ChangeRemaining = styled.span`
    cursor:pointer;
`

const RemainingSlide = styled.div<{amount: number; remaining?: number;}>`
    position: absolute;
    height: 2px;
    left: 0;
    right: 0;
    bottom: -1px;
    background-color: ${props => props.remaining === 100 || props.remaining === 0 ? `#d6d7da` : "grey" };
    .slide {
        position: absolute;
        left: 0;
        right: ${props => props.remaining ? `${props.remaining}%` : "100%" };
        background-color:red;
        height: 2px;      
        transition: all 1s linear;  
    }   
`

type GiftcardProps = {
    sort: string;
    name?: string;
    user?: any;
    owner?: any;
    remaining?: number;
    amount: number;
    status: Status | undefined;
    validDate: string | undefined;
    id: string;
    triggerReload: () => void;
}
export const Giftcardrow = ({sort, name, owner, remaining, amount, status, validDate, id, triggerReload} : GiftcardProps) => {

    const [user] = store.useState("user");
    const [filters] = store.useState("filters");
    const getExpired = window.sessionStorage.getItem('expired');
    const firestore = getFirestore(db)

    const [editRemaining, setEditRemaining] = useState<boolean>(false)
    const [editName, setEditName] = useState<boolean>(false)

      const setRemainingAmount = (id: string, amount: number) => {
        const docRef = doc(firestore, "giftcards", id);

        updateDoc(docRef, {
            remaining: amount,
        }).then(() => {
            console.log('succesvol aangepast');
        }).catch(() => {
            console.log('er is iets fout gegaan');
        }).finally(() => {
            triggerReload();
        })
    }

    const setNameAmount = (id: string, name: string) => {
        const docRef = doc(firestore, "giftcards", id);

        updateDoc(docRef, {
            name
        }).then(() => {
            console.log('succesvol aangepast');
        }).catch(() => {
            console.log('er is iets fout gegaan');
        }).finally(() => {
            triggerReload();
        })
    }


    const deleteGiftcard = (id: string) => {

        document.querySelector(`[data-id="delete-${id}"`)?.classList.add('loading');

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
            document.querySelector(`[data-id="delete-${id}"`)?.classList.remove('loading');
        }).catch(() => {
            console.log('er is iets fout gegaan');
        }).finally(() => {
            triggerReload();
        })


    }


    const setGiftcardUsed = (giftcard: Giftcard, gebruikt: boolean) => {

        document.querySelector(`[data-id="used-${giftcard.id}"`)?.classList.add('loading');

        const docRef = doc(firestore, "giftcards", giftcard.id);

        updateDoc(docRef, {
            name: giftcard.name,
            owner: giftcard.owner,
            amount: giftcard.amount,
            validDate: giftcard.validDate,
            status: gebruikt ? Status.USED : Status.DEFAULT,
        }).then(() => {
            console.log('succesvol aangepast');
            document.querySelector(`[data-id="used-${giftcard.id}"`)?.classList.remove('loading');
        }).catch(() => {
            console.log('er is iets fout gegaan');
        }).finally(() => {
            triggerReload();
        })

    }
    const saveAndCloseRemaining = (value: any) => {
        
        setRemainingAmount(id, value.target.value)
        setEditRemaining(false);
    }
    const saveAndCloseName = (value: any) => {
        setNameAmount(id, value.target.value);
        setEditName(false);
    }


    return <GiftCardRowStyled><Column row={true}>
                        <span>{editName ? 
                            <input type="string" name="editName" defaultValue={name && name} onBlur={(value) => saveAndCloseName(value)}/> : 
                            <span onClick={() => setEditName(true)}>{name}</span>}
                        </span>
                        <span>{user.currentEmail === 'jasper.huting@gmail.com' && `(${owner})`}</span>
                    </Column>
                    <Column align="right">     
                    
                        {<Amount>
                            {
                                sort !== 'expired' ? 
                            editRemaining ? 
                                <input type="number" name="remaining" max={amount} defaultValue={remaining && amount && remaining > 0 ? remaining : amount} onBlur={(value) => saveAndCloseRemaining(value)}/> : 
                                <ChangeRemaining onClick={() => setEditRemaining(true)}>{formatCurrency(remaining && amount && remaining > 0 ? remaining : amount)}</ChangeRemaining>
                                : formatCurrency(remaining && amount && remaining > 0 ? remaining : amount)
                        }</Amount>}

                        {amount && remaining && remaining > 0 && amount !== remaining && 
                        <TotalAmount onClick={() => setEditRemaining(true)}>
                            totaal: {formatCurrency(amount)}
                        </TotalAmount>}

                        
                        
                        {sort !== 'expired' && <RemainingSlide amount={amount} remaining={remaining ? remaining ? 100 - (remaining / (amount / 100)) : 100 : 0}>
                            <div className="slide"></div>
                        </RemainingSlide>}
                    </Column>
                    <Column row={true}>
                        {StatusTranslation(status)?.icon}
                        <Small color={StatusTranslation(status)?.color}>{StatusTranslation(status)?.text}</Small>
                    </Column>

                    <Column>{giftcardDate(validDate)}</Column>
                    <Column row={false}>
                        <GiftCardbutton disabled={status === Status.DELETED} data-id={`delete-${id}`} onClick={() => deleteGiftcard(id)} >
                            <FontAwesomeIcon icon={faTrash} />
                        </GiftCardbutton>

                        {status === Status.USED && <GiftCardbutton data-id={`used-${id}`} onClick={() => setGiftcardUsed({id, name, owner, amount, remaining, status, validDate}, false)} >
                            <FontAwesomeIcon icon={faUndo} />
                        </GiftCardbutton>}

                        {(status === Status.DEFAULT || status === Status.NEW) && <GiftCardbutton data-id={`used-${id}`} onClick={() => setGiftcardUsed({id, name, owner, amount, remaining, status, validDate}, true)}>
                            <FontAwesomeIcon icon={faCreditCard} />
                        </GiftCardbutton>}

                    </Column></GiftCardRowStyled>
}
