import React,{useState} from 'react'
import axios from "axios"
import Admin from './access/AdminAccess'
import Student from './access/StudentAccess'
import "../App.css"

export default function Landing() {
    const [id, setId] = useState('')
    const [userExists, setUserExists] = useState(false)
    const [userRole, setUserRole] = useState()
    const [errorMsg, setErrorMsg] = useState('')

    function getUser(id) {
        try {
            axios.get(`/checkUserExist/${id}`)
            .then(res => {
                if (res.data.userExists) {
                    setUserRole(res.data.userRole)
                    setUserExists(true)
                } else {
                    setErrorMsg("User doesn't exist")
                }
            })
        }catch(error) {
            console.log(error)
        }
    }
    if (userExists) {
        if (userRole === 'student') {
            return <Student/>
        }
        else {
            return <Admin/>
        }
    }
  return (
    <div className='landing'>
        <div className='input'>
        <h1>Welcome to SUN Labs</h1>
        <p>{errorMsg}</p>
            <input placeholder='Enter ID' onChange={(e)=>setId(e.target.value)}></input>
            <button onClick={()=>getUser(id)}>GO</button>
        </div>
    </div>
  )
}
