import styled from "styled-components/macro"

export const StyledColumn = styled.div<{row?: Boolean}>`

  
  width: 25%;
  display: flex;
  padding: 5px;
  box-sizing: border-box;
  align-content: center;
  justify-content: center;
  background-color: white;
  align-items: center;
  display: flex;
  flex-direction: ${props => props.row ? 'column' : 'row'};
`


export const Column = (props: any) => {
    return <StyledColumn>{props.children}</StyledColumn>
}
