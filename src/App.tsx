import { useState, useEffect } from 'react';

import { collection, getDocs, getFirestore, doc, addDoc, deleteDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";

import styled from 'styled-components/macro';

import db from './db/index';

import './App.css';
import AddGiftcard, { AddGiftCardData } from './AddGiftcard';

const GiftCard = styled.div`
    padding: 10px;
    display: flex;
    width: 100%;
    border-bottom: 1px solid red;
    background-color: white;
    color: #222;
    margin-bottom: 6px;
      box-sizing: border-box;

`
const GiftCardName = styled.div`
  margin: 2px 4px;
  flex: 1;
`
const GiftCardAmount = styled.div`
  margin: 2px 4px;
  flex: 1;
`
const GiftCardvalidDate = styled.div`
  margin: 2px 4px;
  flex: 1;
`

const GiftCardOwner = styled.div`
  flex: 1%;
  margin: 2px 4px;
`

type Giftcards = {
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

const registerWithEmailAndPassword = async (name: string, email: string, password: string) => {
  try {
    const dataaa = getFirestore(db);

    const auth = getAuth(db);

    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await addDoc(collection(dataaa, "users"), {
      uid: user.uid,
      name,
      authProvider: "local",
      email,
    });
  } catch (err: any) {
    console.error(err);
    alert(err.message);
  }
};

const logInWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const auth = getAuth(db);
    const test = await signInWithEmailAndPassword(auth, email, password);
    
    
  } catch (err: any) {
    console.error(err);
    alert(err.message);
  }
};

const Login = ({loginState, userUid} : {loginState: string, userUid: string}) => {

  type LogindataProps = {
    email: string;
    password: string;
  }
  type RegisterdataProps = {
    email: string;
    name: string;
    password: string;
  }

  const [LoginData, setLoginData] = useState<LogindataProps>({
        email: '',
        password: '',
    })
  const [RegisterData, setRegisterData] = useState<RegisterdataProps>({
        email: '',
        name: '',
        password: '',
    })

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const target = event.target as HTMLInputElement;
        setLoginData({ ...LoginData, [name]: target.value })
    }
  const handleRegisterChange = (event: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const target = event.target as HTMLInputElement;
        setRegisterData({ ...RegisterData, [name]: target.value })
    }

  return <>

    {loginState === 'loggedOut' && <>login:
    <input value={LoginData.email} placeholder="email" type="text" onChange={($el) => handleChange($el, 'email')} />
    <input value={LoginData.password} placeholder="password" type="password" onChange={($el) => handleChange($el, 'password')} />
    <button disabled={!LoginData.email && !LoginData.password} onClick={() => logInWithEmailAndPassword(LoginData.email, LoginData.password)}>Login</button>
    </>}
  

{loginState === 'loggedOut' && <>
    <>register:</>
    <input value={RegisterData.email} placeholder="email" type="text" onChange={($el) => handleRegisterChange($el, 'email')} />
    <input value={RegisterData.name} placeholder="name" type="text" onChange={($el) => handleRegisterChange($el, 'name')} />
    <input value={RegisterData.password} placeholder="password" type="password" onChange={($el) => handleRegisterChange($el, 'password')} />
    <button onClick={() => registerWithEmailAndPassword(RegisterData.name, RegisterData.email, RegisterData.password)}>Register</button>
    </>
}
    {loginState === 'loggedIn' && userUid && <button onClick={() => logout()}>Logout</button>}    
  </>
}



function App() {

  const [giftcards, setGiftcards] = useState<Giftcards[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [currentEmail, setCurrentEmail] = useState<string>('');
  const [userUid, setUserUid] = useState<string>('');
  const [loginState, setLoginState] = useState<string>('loggedOut');

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

  const fetchPost = async ()  => {
    await getDocs(collection(firestore, "giftcards"))
      .then((querySnapshot) => {
        const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })).filter((data: Giftcards) => {
            if (currentEmail === 'jasper.huting@gmail.com') {
              return true;
            }

            if (userUid) {
              return data.owner === userUid
            } else {
              return false;
            }
          
          }).sort((a: Giftcards, b: Giftcards) => {
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
        let totalAmount = newData.reduce((accumulator, currentValue: Giftcards) => accumulator + (currentValue && Number(currentValue?.amount) || 0),
          initialValue);
        setTotalAmount(totalAmount)
        setGiftcards(newData);
      })
  }

  useEffect(() => {
    fetchPost();
  }, [userUid])

  return (
    <div className="App">
      <div className="App-header">
        <Login loginState={loginState} userUid={userUid}/>
        email: {currentEmail} <br />
        userUid: {userUid}
        <h1>({giftcards.length}) Giftcards, totaal: € {totalAmount}</h1>
        {giftcards.map((giftcard) => {
          return <GiftCard key={giftcard.id} data-id={giftcard.id}>
            <GiftCardName>{giftcard.name}</GiftCardName>
            <GiftCardAmount>{giftcard.amount} euro</GiftCardAmount>
            {currentEmail === 'jasper.huting@gmail.com' && <GiftCardOwner>{userUid === giftcard.owner ? currentEmail : giftcard.owner}</GiftCardOwner>}
            <GiftCardvalidDate>{giftcardDate(giftcard.validDate)}</GiftCardvalidDate>
            <button onClick={() => deleteGiftcard(giftcard.id)} >Verwijder</button>
          </GiftCard>
        })}

        <AddGiftcard owner={userUid} addGiftcard={(data: AddGiftCardData) => addGiftcard(data)} />
      </div>
    </div>
  );
}

export default App;
