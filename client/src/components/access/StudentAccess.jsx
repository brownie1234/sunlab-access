import React,{useState} from 'react'
import axios from "axios"

export default function Student() {
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [fromValues, setFormValues] = useState({
    action: 'login',
    id: '',
  })

  function submit(event) {
    try {
      event.preventDefault();
      setSuccessMsg('')
      setErrorMsg('')
      axios.get(`/checkUserExist/${fromValues.id}`)
        .then(res => {
          if (res.data.userExists && res.data.userRole === 'student') {
            if (!res.data.hasAccess) {
              setErrorMsg("Access Denied")
            } else {
              axios({
                method: 'post',
                url: `/userLoginAndLogout`,
                data: { id: fromValues.id, action: fromValues.action }
              }).then(res => {
                if (res.data.success) {
                  setSuccessMsg(`${fromValues.action} was successful`)
                } else {
                  setErrorMsg(`${fromValues.action} was unsuccessful`)
                }
              })
            }
          } else {
            setErrorMsg("Invalid ID")
          }
        })
    }catch(error){
      console.log(error)
    }
  }
 

  return (
    <div className='student-access'>
        <div className='student-inputs'>
          <h1>Student Access</h1>
          <div>
            <p className='error'>{errorMsg}</p>
            <p className='success'>{successMsg}</p>
          </div>
            <form onSubmit={(e)=>submit(e)} method='post'>
              <input placeholder='Enter ID' value={fromValues.id} onChange={(e)=>setFormValues(prev => ({...prev, id: e.target.value}))}></input>
              <button type='submit'>Swipe</button>
              <input type="radio" checked={fromValues.action === "login"} onChange={(e)=>setFormValues(prev => ({...prev, action: e.target.value}))} name="action" value="login"/>
              <label>Login</label>
              <input type="radio" checked={fromValues.action === "logout"} onChange={(e)=>setFormValues(prev => ({...prev, action: e.target.value}))} name="action" value="logout"/>
              <label>Logout</label>
            </form>
        </div>
    </div>
  )
}
