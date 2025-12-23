import React from 'react'
import "../Components_css/login.css"
export const Login = () => {
    setLogin(true);   // 
  return (
    <div className='loginContainer'>
        <div>
            <h1>Login</h1>
            <input type="text" placeholder='Username' />
            <h1>Password</h1>
            <input type="password" placeholder='Password' />
            <div className='action_buttons'>
                <button className='login'>Login</button>
                <button className='register'>Register</button>
            </div>
            
        </div>
    </div>
  )
}
