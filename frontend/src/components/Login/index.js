
// import {useNavigate} from 'react-router-dom';
import { useState } from 'react';
import {v4 as uuidv4} from 'uuid';
import Cookies from 'js-cookie';

import './index.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [showErr, setShowErr] = useState(false);
    const [errMsg, setErrMsg] = useState('');

    // const navigate = useNavigate();

    const onChangeEmail = event => {
        setEmail(event.target.value);
    }

    const onChangeName = event => {
        setName(event.target.value);
    }

    const onChangeRole = event => {
        setRole(event.target.value);
    }

    const submitSuccess = (jwtToken) => {
        Cookies.set('jwt_token', jwtToken, {expires: 30, path: "/loans"})
        // navigate("/loans", {replace: true});
        console.log(jwtToken);
    }

    const submitFailure = (errMsg) => {
        setShowErr(true);
        setErrMsg(errMsg);
    }

    const submitForm = async event => {
        event.preventDefault();
        const userId = uuidv4();
        const userDetails = {
            id: userId,
            name,
            email,
            role
        }
        const url = 'http://localhost:3000/login';
        const options = {
            method: 'POST',
            body: JSON.stringify(userDetails)
        }
        const response = await fetch(url, options)
        const responseData = await response.json()
        if (response.ok === true) {
            submitSuccess(responseData.jwt_token)
        }else {
            submitFailure(responseData.error_msg)
        }
    }

    return (
        <div className='login-container'>
            <div className='center-view'>
                <h1 className='form-heading'>Login Form</h1>
            </div>
            <form onSubmit={submitForm}>
                <div className='vertical'>
                    <label htmlFor='name' className='label-element'>name:</label>
                    <input type="text" value={name} placeholder='Enter the your name' onChange={onChangeName} className='input-element' id="name" />
                </div>
                <div className='vertical'>
                    <label htmlFor='email' className='label-element'>Email:</label>
                    <input type="email" value={email} placeholder='Enter the your email' onChange={onChangeEmail} className='input-element' id="email" />
                </div>
                <div className='vertical'>
                    <label htmlFor='email' className='label-element'>Role:</label>
                    <select onChange={onChangeRole} className='select-element'>
                        <option>customer</option>
                        <option>admin</option>
                    </select>
                </div>
                <button type="submit" className='login-btn'>submit</button>
                {showErr && <p>* {errMsg}</p>}
            </form>
        </div>
    )
    
}

export default Login 