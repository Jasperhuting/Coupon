
type InformationProps = {
    amountGiftcards: number;
    totalAmount: number;
}

export const InformationBar = ({ amountGiftcards, totalAmount }: InformationProps) => {

    

    return <>
        <h1>({amountGiftcards}) Giftcards, totaal: € {totalAmount}</h1>
    </>
}
