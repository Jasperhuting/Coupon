import styled from "styled-components/macro"

export const StyledColumn = styled.div<{ row?: Boolean, align: String }>`

  
  width: 25%;
  display: flex;
  padding: 5px 20px 5px 5px;
  box-sizing: border-box;
  align-content: center;
  background-color: white;
  align-items: center;
  display: flex;
  justify-content: ${props => props.align === "right" ? 'flex-end' : 'center'};
  flex-direction: ${props => props.row ? 'column' : 'row'};
`


export const Column = (props: any) => {
  console.log(props.align);
  return <StyledColumn row={props.row} align={props.align}>{props.children}</StyledColumn>
}
