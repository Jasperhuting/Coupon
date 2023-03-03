import { UserContext } from "App";
import { useContext } from "react";

type InformationProps = {
    amountGiftcards: number;
    totalAmount: number;
}

export const InformationBar = ({ amountGiftcards, totalAmount }: InformationProps) => {

    const getExpired = window.localStorage.getItem('expired');


    const toggleHideExpired = (e: any) => {
        e.preventDefault();
        const getExpired = window.localStorage.getItem('expired');
        window.localStorage.setItem('expired', getExpired === 'true' ? 'false' : 'true');
    };

    return <>
        {getExpired?.toString()}
        <button onClick={toggleHideExpired}>verberg verlopen</button>
        <h1>({amountGiftcards}) Giftcards, totaal: € {totalAmount}</h1>
    </>
}
