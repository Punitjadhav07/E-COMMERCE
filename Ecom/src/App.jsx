import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Login } from './Frontend_Components/Components/Login.jsx'
function App() {
  const [login , setlogin] = useState(false);

  return (
    <>
     <Login setlogin={setlogin}/>
    </>
  )
}

export default App
