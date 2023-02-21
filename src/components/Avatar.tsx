import styled from "styled-components/macro";

const StyledAvatar = styled.div`
    border-radius: 100%;
    width: 30px;
    height: 30px;
    border: 1px solid #2b3446;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
`

export const Avatar = (props: any) => {
    return <StyledAvatar>{props.children}</StyledAvatar>;
}
