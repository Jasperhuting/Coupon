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
    owner: string
}
type FormdataProps = {
    name: string,
    owner: string,
    amount: number,
    validDate: string,
}

const AddGiftCardContainer = styled.div`
    display: flex;
    width: 100%;
`

const AddGiftcardInput = styled.input`
    flex: 1;
    padding: 6px;
    margin-right: 6px;
`

const AddGiftcard = (props: AddGiftCardProps) => {

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

    return (
        <AddGiftCardContainer>
            <AddGiftcardInput name="name" placeholder="name" value={formData.name} type="text" onChange={($el) => handleChange($el, 'name')} />
            <AddGiftcardInput name="amount" placeholder="amount" value={formData.amount} type="number" onChange={($el) => handleChange($el, 'amount')} />
            <AddGiftcardInput name="validDate" placeholder="validDate" type="date" value={formData.validDate} onChange={($el) => handleChange($el, 'validDate')} />
            <button onClick={addGiftCard} disabled={!formData.name}>addGiftCard</button>
        </AddGiftCardContainer>

    )

}

export default AddGiftcard;
