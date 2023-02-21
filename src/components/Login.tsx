import { useState } from "react";

import { collection, getFirestore, addDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";

import db from '../db/index';
import styled from "styled-components/macro";

type LogindataProps = {
    email: string;
    password: string;
  }
  type RegisterdataProps = {
    email: string;
    name: string;
    password: string;
  }

const StyledForm = styled.form`
    max-width: 500px;
    width: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    margin: 0 auto;
    gap: 6px;
    
`

  const StyledInput = styled.input`
    width: 100%;
    box-sizing: border-box;
    padding: 3px;
    border-radius: 4px;
    border: 1px solid #4a92ee;
  `
  const StyledButton = styled.button`
    background-color: #4a92ee;
    border: 1px solid #4a92ee;
    padding: 6px 3px;
    border-radius: 4px;
    color: white;
    font-weight: bold;
    cursor: pointer;

    &:hover {
        background-color: rgba(40, 107, 193, 1);
    }
  `

  const StyledTextButton = styled.button`
    background-color: transparent;
    border: 0px solid transparent;
    cursor: pointer;
    text-decoration: underline;
  `

  const FormTitle = styled.h2`
    color: black;
  `


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
    await signInWithEmailAndPassword(auth, email, password);


  } catch (err: any) {
    console.error(err);
    alert(err.message);
  }
};

const login = (e: any, LoginData: LogindataProps) => {
    e.preventDefault();
    logInWithEmailAndPassword(LoginData.email, LoginData.password)
}

export const Login = ({ loginState }: { loginState: string }) => {

    const [showRegister, setShowRegister] = useState<boolean>(false);

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

    {loginState === 'loggedOut' && !showRegister && <>
    <StyledForm onSubmit={(e) => login(e, LoginData)}>
      <FormTitle>login</FormTitle>
      <StyledInput value={LoginData.email} placeholder="email" name="email" type="email" onChange={($el) => handleChange($el, 'email')} />
      <StyledInput value={LoginData.password} placeholder="password" type="password" onChange={($el) => handleChange($el, 'password')} />
      <StyledButton disabled={!LoginData.email && !LoginData.password} onClick={() => logInWithEmailAndPassword(LoginData.email, LoginData.password)}>Login</StyledButton>
      <br />
      <StyledTextButton onClick={() => setShowRegister(true)}>Register</StyledTextButton>
      </StyledForm>
    </>}


    {loginState === 'loggedOut' && showRegister && <>
      <StyledForm onSubmit={() => registerWithEmailAndPassword(RegisterData.name, RegisterData.email, RegisterData.password)}>
      <FormTitle>Registreren</FormTitle>
      <StyledInput value={RegisterData.name} placeholder="name" type="text" onChange={($el) => handleRegisterChange($el, 'name')} />
      <StyledInput value={RegisterData.email} placeholder="email" name="email" type="email" onChange={($el) => handleRegisterChange($el, 'email')} />
      <StyledInput value={RegisterData.password} placeholder="password" type="password" onChange={($el) => handleRegisterChange($el, 'password')} />
      <StyledButton onClick={() => registerWithEmailAndPassword(RegisterData.name, RegisterData.email, RegisterData.password)}>Register</StyledButton>
      <br />
      <StyledTextButton onClick={() => setShowRegister(false)}>Login</StyledTextButton>
      </StyledForm>
    </>
    }
  </>
}
