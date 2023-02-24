import { useState, useEffect } from 'react';

import { collection, getDocs, getFirestore, doc, addDoc, deleteDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
  import { faUserNinja } from '@fortawesome/free-solid-svg-icons'

import styled from 'styled-components/macro';

import db from './db/index';

import './App.css';
import AddGiftcard, { AddGiftCardData } from './components/AddGiftcard';

import { Column, StyledColumn } from './components/column';
import { InformationBar } from './components/InformationBar';
import { Login } from './components/Login';
import { Avatar } from './components/Avatar';


const GiftCardRow = styled.div<{extra?: boolean, endrow?: boolean}>`  
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 1px;
    border-bottom: 1px solid #2b3446;    
    margin-bottom: 1px;
    border-left: 1px solid #e5e5e5;
    border-right: 1px solid #e5e5e5;
    box-sizing: border-box;
     ${StyledColumn} {
      &:nth-child(1) {
      align-items: flex-start;
      padding-left: 20px;
      }
   }
   ${StyledColumn} {
      &:nth-child(2) {
      align-items: flex-start;
      padding-left: 20px;
      }
   }

   background-color: ${props => props.endrow ? '#000' : ''};
   ${StyledColumn} {
      background-color: ${props => props.endrow ? '#000 !important' : ''};
      color: ${props => props.endrow ? '#fff !important' : ''};
      margin-top: ${props => props.endrow ? '-2px' : '0'};

   }

   position: ${props => props.endrow ? 'sticky' : 'relative'};
   bottom: ${props => props.endrow ? '0' : 'auto'};
`

const GiftCard = styled.div<{extra: boolean}>`
width: 100%;

&:nth-child(even) {
  ${GiftCardRow} {
          ${StyledColumn} {
    background-color: ${props => !props.extra && '#eee'};
   }
  }
}

  
`

const GiftCardbutton = styled.button`
      padding: 10px;
      background-color: white;
      box-sizing: border-box;
      display: block;
      border: 1px solid #e5e5e5;
      cursor: pointer;
      border-radius: 4px;

      &:hover {
        background-color: #e5e5e5;
      }
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


const TableHeader = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 1px;
  margin-bottom: 2px;

  ${StyledColumn} {
    background-color: #2b3446;
    color: white;

    &:nth-child(2) {      
      align-items: flex-start;
      padding-left: 20px;
    }

    &:nth-child(1) {
      border-top-left-radius: 4px;
      align-items: flex-start;
      padding-left: 20px;
    }
    &:last-child {
      border-top-right-radius: 4px;
    }
  }
  
`


const GiftCardOwner = styled.div`
  margin: 2px 4px;
  font-size: 11px;
`

type Giftcard = {
  name?: string;
  amount?: number;
  validDate?: string;
  owner?: string;
  id: string;
}

const logout = () => {
  const auth = getAuth(db);
  const test = signOut(auth);
  console.log(test);
};

const LoggedInStyled = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`

const LoggedIn = ({ loginState, userUid, currentEmail } : { loginState: string, userUid: string, currentEmail: string }) => {
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


function App() {

  const [giftcards, setGiftcards] = useState<Giftcard[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [currentEmail, setCurrentEmail] = useState<string>('');
  const [userUid, setUserUid] = useState<string>('');
  const [loginState, setLoginState] = useState<string>('loggedOut');
  const [users, setUsers] = useState<any>([]);

  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user && user.email) {
      setLoggedIn(true)
      setUserUid(user.uid);
      setCurrentEmail(user.email);
      setLoginState('loggedIn')
    } else {
      setLoggedIn(false)
      setCurrentEmail('');
      setUserUid('');
      setLoginState('loggedOut')
    }
  });

  const firestore = getFirestore(db)

  const months = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];



  const deleteGiftcard = (id: string) => {

    document.querySelector(`[data-id="${id}"]`)?.classList.add('delete');

    const docRef = doc(firestore, "giftcards", id);
    deleteDoc(docRef).then(() => {
      console.log('succesvol verwijderd');
    }).catch(() => {
      console.log('er is iets fout gegaan');
    }).finally(() => {
      fetchPost();
    })
  }

  const addGiftcard = (data: AddGiftCardData) => {
    const dbRef = collection(firestore, "giftcards");
    addDoc(dbRef, data).then(() => {
      console.log('succesvol')
    }).finally(() => {
      fetchPost();
    })
  }

  const giftcardDate = (giftcardDate: string | undefined) => {
    if (giftcardDate === null || !giftcardDate || giftcardDate === 'Invalid Date') {
      return 'Geen einddata';
    }
    const date = new Date(giftcardDate);
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  const fetchPost = async () => {

    await getDocs(collection(firestore, "giftcards"))
      .then(async (querySnapshot) => {

        const users = [] as any;
        await getDocs(collection(firestore, "users")).then((querySnapshot) => {
          querySnapshot.docs.map((user) => users.push(user.data()))
        })

        setUsers(users);

        const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })).filter((data: Giftcard) => {
          if (currentEmail === 'jasper.huting@gmail.com') {
            return true;
          }

          if (userUid) {
            return data.owner === userUid
          } else {
            return false;
          }

        }).sort((a: Giftcard, b: Giftcard) => {
          if (!Date.parse(a.validDate!)) {
            return 1;
          }
          if (!Date.parse(b.validDate!)) {
            return -1;
          }
          // Convert the date strings to Date objects and compare them
          const dateA = new Date(a.validDate!);
          const dateB = new Date(b.validDate!);
          if (dateA < dateB) {
            return -1;
          }
          if (dateA > dateB) {
            return 1;
          }
          return 0;
        });


        console.log(newData);
        let initialValue = 0;
        let totalAmount = newData.reduce((accumulator, currentValue: Giftcard) => accumulator + (currentValue && Number(currentValue?.amount) || 0),
          initialValue);
        setTotalAmount(Number(totalAmount.toFixed(2)))
        setGiftcards(newData);
      })
  }

  useEffect(() => {
    fetchPost();
  }, [userUid])

  return (
    <>
    <div className="App">
      <div className="App-header">
        <LoggedIn loginState={loginState} currentEmail={currentEmail} userUid={userUid} />
      </div>
      {loggedIn ?
        <Content>
          <InformationBar amountGiftcards={giftcards.length} totalAmount={totalAmount}/>
          <TableHeader>
            <Column>Naam</Column>
            <Column>Waarde</Column>
            <Column>Einddatum</Column>
            <Column></Column>
          </TableHeader>
          {giftcards.map((giftcard) => {
            return <GiftCard key={giftcard.id} data-id={giftcard.id} extra={currentEmail === 'jasper.huting@gmail.com'}>
              <GiftCardRow>
                    <Column>{giftcard.name}</Column>
                    <Column>{giftcard.amount} euro</Column>
              
                    <Column>{giftcardDate(giftcard.validDate)}</Column>
                    <Column><GiftCardbutton onClick={() => deleteGiftcard(giftcard.id)} >Verwijder</GiftCardbutton></Column>
              </GiftCardRow>
              {currentEmail === 'jasper.huting@gmail.com' && <GiftCardRow extra={true}>
                <Column>
                
                  <GiftCardOwner>{users.find((user: any) => user.uid === giftcard.owner).email}</GiftCardOwner>
                </Column>
                <Column></Column>
                <Column></Column>
                <Column></Column>
              </GiftCardRow>}
            </GiftCard>
          })}

          <GiftCard key={giftcards.length + 1} data-id={giftcards.length + 1} extra={currentEmail === 'jasper.huting@gmail.com'}>
              <GiftCardRow endrow={true}>
                    <Column>Totaal ({giftcards.length})</Column>
                    <Column>{totalAmount} euro</Column>
              
                    <Column></Column>
                    <Column></Column>
              </GiftCardRow>
            </GiftCard>
        </Content>:
        <Content>
          <Login loginState={loginState} />
        </Content>}
        
    </div>
    <AddGiftcard loggedIn={loggedIn} owner={userUid} addGiftcard={(data: AddGiftCardData) => addGiftcard(data)} />
    </>
  );
}

export default App;
