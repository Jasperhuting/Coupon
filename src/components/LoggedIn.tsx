import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserNinja } from '@fortawesome/free-solid-svg-icons';
import { logout } from '../firestore';
import { Avatar } from './Avatar';

const LoggedInStyled = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

export const LoggedIn = ({ loginState, userUid, currentEmail }: { loginState: string, userUid: string, currentEmail: string }) => {
  return <>
    {loginState === 'loggedIn' && userUid && <LoggedInStyled>
      <Avatar>
        <FontAwesomeIcon size="1x" color="#2b3446" icon={faUserNinja} />
      </Avatar>
      {currentEmail}
      <button onClick={() => logout()}>Logout</button>
    </LoggedInStyled>}
  </>
};
