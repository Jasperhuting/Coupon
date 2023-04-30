import { useState, useEffect, createContext, useMemo } from 'react';

import { getAuth, onAuthStateChanged } from "firebase/auth";

import { createStore } from 'state-pool'

import styled from 'styled-components/macro';

import './App.css';
import { AddGiftcard } from './components/AddGiftcard';

import { InformationBar } from './components/InformationBar';
import { Login } from './components/Login';
import { Avatar } from './components/Avatar';
import { GiftcardTable } from './components/GiftcardTable';
import { GetAllGiftcardsReturnProps } from './types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserNinja } from '@fortawesome/free-solid-svg-icons';
import { getAllGiftcards, logout } from './firestore'




const LoggedInStyled = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(100% - 40px);
  max-width: 1024px;
  padding: 20px;
  box-sizing: border-box;
  background-color: white;
  border-radius: 4px;
`




// const GiftCardOwner = styled.div`
//   margin: 2px 4px;
//   font-size: 11px;
// `

export const store = createStore();

export const UserContext = createContext<any>(null);

function App() {


  const [giftcards, setGiftcards] = useState<GetAllGiftcardsReturnProps>();
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [currentEmail, setCurrentEmail] = useState<string>('');
  const [userUid, setUserUid] = useState<string>('');
  const [showExpired, toggleShowExpired] = useState<boolean>(true);
  const [loginState, setLoginState] = useState<string>('loggedOut');


  // const [sharedData, setSharedData] = useState<MyContextType>({
  //   currentEmail: '',
  //   currentUid: '',
  //   hideExpiredState: false,
  //   hideUsedState: false,
  // });

  // const setData = () => {
  //   setSharedData({
  //     currentEmail: '',
  //     currentUid: '',
  //     hideExpiredState: true,
  //     hideUsedState: false,
  //   })
  // }

  const getGiftcards = async () => {
    const giftcards = await getAllGiftcards(userUid, currentEmail);

    setGiftcards(giftcards)
  }

  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user && user.email) {
      setLoggedIn(true)
      setUserUid(user.uid);
      setCurrentEmail(user.email);
      setLoginState('loggedIn')
      store.setState("user", { currentEmail: user.email, currentUid: user.uid })

    } else {
      setLoggedIn(false)
      setCurrentEmail('');
      setUserUid('');
      setLoginState('loggedOut')
      store.setState("user", { currentEmail: false, currentUid: false })
    }
  });


  useEffect(() => {

    if (giftcards?.allData && giftcards?.allData.length > 0) {
      return;
    }

    getGiftcards();
  }, [giftcards?.allData, loggedIn])



  const LoggedIn = ({ loginState, userUid, currentEmail }: { loginState: string, userUid: string, currentEmail: string }) => {
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



  return (
    <>
      <div className="App">
        <div className="App-header">
          <LoggedIn loginState={loginState} currentEmail={currentEmail} userUid={userUid} />
        </div>

        {loggedIn ?
          <Content>
            {giftcards && <>
              <InformationBar amountGiftcards={giftcards.amount} totalAmount={giftcards.totalAmount} />
              <GiftcardTable
                expiredGiftcards={giftcards.expired}
                usedGiftcards={giftcards.used}
                deletedGiftcards={giftcards.deleted}
                amountGiftcards={giftcards.amount}
                newGiftcards={giftcards.new}
                totalAmount={giftcards.totalAmount}
                allData={giftcards.allData}
                triggerReload={() => getGiftcards()}
                defaultGiftcards={giftcards.default} ></GiftcardTable>
            </>}
          </Content> :
          <Content>
            <Login loginState={loginState} />
          </Content>}
          {loggedIn && <AddGiftcard triggerReload={() => getGiftcards()} />}
      </div>
      
    </>
  );
}

export default App;



{/* {giftcards.filter((e) => e.validDate).filter((e) => e.used).filter((e) => {
            const vandaag = new Date();
            const dateInTime = e.validDate ? new Date(e.validDate).getTime() : new Date().getTime();
            return dateInTime >= vandaag.getTime();
            }).map((giftcard: Giftcard) => {
            let datum = new Date();
            const vandaag = new Date();
            console.log('giftcard', giftcard.owner)
            if (giftcard.validDate) {
              datum = new Date(giftcard.validDate);
            }
            const day = datum.getDate();
            const month = datum.getMonth()+1;
            const year = datum.getFullYear();

            const datumPlusDays = addDays(vandaag, 7);

            const userEmail = users.find((e: User) => {
                  return e.uid === giftcard.owner
                })

            if (datum.getTime() <= datumPlusDays.getTime()) {            
              return <>
                {userEmail ? userEmail.email : ''}
                {day}-{month}-{year}
              <br /></>
            }
            
          })} */}
