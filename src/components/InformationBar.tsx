
type InformationProps = {
    amountGiftcards: number;
    totalAmount: number;
}

export const InformationBar = ({ amountGiftcards, totalAmount }: InformationProps) => {

    

    return <>
        <h1>({amountGiftcards}) Giftcards, totaal: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(totalAmount)}</h1>
    </>
}
