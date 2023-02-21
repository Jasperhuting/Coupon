import { useState } from "react"
import styled from "styled-components/macro"

export type AddGiftCardData = {
    name: string,
    owner: string,
    amount: number,
    validDate: string,
}

type AddGiftCardProps = {
    addGiftcard: (data: AddGiftCardData) => void,
    owner: string,
    loggedIn: boolean
}
type FormdataProps = {
    name: string,
    owner: string,
    amount: number,
    validDate: string,
}

const AddGiftCardContainer = styled.div`
    display: flex;
    position: sticky;
    bottom: 0;
    width: calc(100% - 40px);
    padding: 20px;
    background-color: rgba(40, 107, 193, 1);
    max-width: 1024px;
    margin: 0 auto;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    margin-top: 20px;
    box-sizing: border-box;
`

const AddGiftcardInput = styled.input`
    flex: 1;
    padding: 6px;
    margin-right: 6px;
`

const AddGiftcard = (props: AddGiftCardProps) => {

    const loggedIn = props.loggedIn;

    console.log("props.owner", props.owner);

    const [formData, setFormData] = useState<FormdataProps>({
        name: '',
        amount: 0,
        owner: props.owner,
        validDate: '',
    })

    const addGiftCard = () => {

        formData.validDate = new Date(formData.validDate).toString();
        formData.owner = props.owner;

        props.addGiftcard(formData);
        setFormData({
            name: '',
            amount: 0,
            owner: props.owner,
            validDate: '',
        });
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const target = event.target as HTMLInputElement;
        setFormData({ ...formData, [name]: target.value })
    }

    return loggedIn ?
        (<AddGiftCardContainer>
            <AddGiftcardInput name="name" placeholder="name" value={formData.name} type="text" onChange={($el) => handleChange($el, 'name')} />
            <AddGiftcardInput name="amount" placeholder="amount" value={formData.amount} type="number" onChange={($el) => handleChange($el, 'amount')} />
            <AddGiftcardInput name="validDate" placeholder="validDate" type="date" value={formData.validDate} onChange={($el) => handleChange($el, 'validDate')} />
            <button onClick={addGiftCard} disabled={!formData.name}>Toevoegen</button>
        </AddGiftCardContainer>)
    : <></>}


export default AddGiftcard;
