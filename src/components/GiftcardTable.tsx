import styled from "styled-components/macro"
import { Status, Giftcard } from "../types";
import { Column, StyledColumn } from './column';
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import db from '../db/index';

import { Giftcardrow } from './GiftcardRow';
import { useEffect, useState } from "react";
import React from "react";


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
const GiftCard = styled.div<{ extra?: boolean }>`
width: 100%;
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
    userInfo: any;
}


export const GiftcardTable = ({ defaultGiftcards, expiredGiftcards, deletedGiftcards, usedGiftcards, newGiftcards, amountGiftcards, totalAmount, allData, triggerReload, userInfo }: Props) => {

    const setGiftcards = (sort: string, set: Giftcard[]) => {
        return set.map(({ id, name, owner, amount = 0, remaining, status, validDate }: Giftcard) =>  <GiftCard key={id} data-id={id}>
                <Giftcardrow id={id} sort={sort} name={name} owner={owner} remaining={remaining} amount={amount} status={status} validDate={validDate} triggerReload={triggerReload} />
            </GiftCard>
        )
    }

    return <>
        <TableHeader>
            <Column>Naam</Column>
            <Column>Besteedbaar bedrag</Column>
            <Column>Status</Column>
            <Column>Einddatum</Column>
            <Column>Acties</Column>
        </TableHeader>
        {newGiftcards && newGiftcards.length > 0 && setGiftcards('new', newGiftcards)}
        
        {defaultGiftcards && defaultGiftcards.length > 0 && setGiftcards('default', defaultGiftcards)}
        
        {usedGiftcards && usedGiftcards.length > 0 && setGiftcards('used', usedGiftcards)}
        
        {deletedGiftcards && userInfo && userInfo.hideDeleted !== undefined && deletedGiftcards.length > 0 && setGiftcards('deleted', deletedGiftcards)}

        {expiredGiftcards && userInfo && userInfo.hideExpired !== undefined && expiredGiftcards.length > 0 && setGiftcards('expired', expiredGiftcards)}

        <GiftCard key={allData.length + 1} data-id={allData.length + 1} extra={true}>
            {/* <GiftcardrowStyled endrow={true}>
                <Column>Totaal ({amountGiftcards})</Column>
                <Column>{new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(totalAmount)} euro</Column>
                <Column></Column>
                <Column></Column>
                <Column></Column>
            </GiftcardrowStyled> */}
        </GiftCard>

    </>
}




