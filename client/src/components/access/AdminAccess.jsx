import React,{useEffect, useState} from 'react'
import axios from "axios"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

export default function Admin() {

    const [userData, setUserData] = useState([])
    const [history, setHistory] = useState([])
    const [openAddUserModal, setOpenAddUserModal] = useState(false)
    const [openDeleteModal, setOpenDeleteModal] = useState({
        open: false,
        id: '',
        userName: ''
    });
    const [openFilterModal, setOpenFilterModal] = useState(false)
    const [newUser, setNewUser] = useState({
        name: '',
        access: false,
        role: 'student'
    })
    const [filter, setFilter] = useState({
        name: '',
        id: '',
        action: '',
        date:'',
        time: '',
    })

    useEffect(()=>{
        try {
            axios.get("/getAllUsers")
            .then(res => setUserData(res.data.users))
            axios.get("/getHistory")
            .then(res => setHistory(res.data.history))
        }catch(error) {
            console.log(error)
        }
    },[])

    function revoke (id) {
        try {
            axios({
                method: 'post',
                url: `/revoke`,
                data: {id: id}
            })
            const updatedUserData = [...userData];
            const userIndex = updatedUserData.findIndex((user) => user.id === id);
            if (userIndex !== -1) {
                updatedUserData[userIndex].access = false;
                setUserData(updatedUserData);
            }
        }catch(error) {
            console.log(error)
        }
    }
    function grant (id) {
        try {
            axios({
                method: 'post',
                url: `/grant`,
                data: {id: id}
            })
            const updatedUserData = [...userData];
            const userIndex = updatedUserData.findIndex((user) => user.id === id);
            if (userIndex !== -1) {
                updatedUserData[userIndex].access = true;
                setUserData(updatedUserData);
            }
        }catch(error) {
            console.log(error)
        }
    }
    async function filterHistory(){
        try {
            let filteredHistory;
            await axios.get("/getHistory")
            .then(res => filteredHistory = res.data.history)
            if (filter.name) {
                filteredHistory = filteredHistory.filter(event => event.name.toLowerCase() === filter.name.toLowerCase())
            }
            if (filter.id) {
                filteredHistory = filteredHistory.filter(event => event.id === filter.id)
            }
            if (filter.action) {
                filteredHistory = filteredHistory.filter(event => event.action === filter.action)
            }
            if(filter.date) {
                filteredHistory = filteredHistory.filter(event => new Date(event.time._seconds *1000).toLocaleDateString() === filter.date)
            }
            if(filter.time) {
                filteredHistory = filteredHistory.filter(event => new Date(event.time._seconds *1000).toLocaleTimeString() === filter.time)
            }
            setHistory(filteredHistory)
        }catch (error) {
            console.log(error)
        }
    }
    function undoFilter() {
        setFilter({name: '',id: '',action: '',date:'',time: '',})
        axios.get("/getHistory")
        .then(res => setHistory(res.data.history))
    }
    function addUser(event) {
        try{
            event.preventDefault();
            axios({
                method: 'post',
                url: `/addUser`,
                data: {name: newUser.name, role: newUser.role, access: newUser.access}
            }).then(res => {
                setUserData(prev=>(
                    [
                        ...prev,
                        {
                            name: newUser.name, 
                            role: newUser.role, 
                            access: newUser.access,
                            id: res.data.id
                        }
                    ]
                ))
            })
            setOpenAddUserModal(false)
        }catch(error) {
            console.log(error)
        }
    }
    function removeUser(id) {
        try {
            axios({
                method: 'post',
                url: `/removeUser`,
                data: {id:id}
            }).then(res => {
                if (res.data.success){
                    let updatedUserData = [...userData]
                    updatedUserData = updatedUserData.filter(user => user.id!==id)
                    setUserData(updatedUserData)
                }
            })
        }catch(error) {
            console.log(error)
        }
    }
  return (
    <div className='admin'>
        <h1>SUN Labs Admin Access</h1>
        <div className='admin-content'>
            <div className='manage-users'>
                <h3>Manage Users</h3>
                <button onClick={()=>setOpenAddUserModal(true)}>Add User</button>
                {/* <form className='add-user' onSubmit={(e)=>addUser(e)}>
                    <div>
                        <label>Name: </label>
                        <input value={newUser.name} onChange={(e)=>setNewUser(prev=>({...prev, name: e.target.value}))}></input>
                    </div>
                    <div>
                        <label>Role: </label>
                        <select value={newUser.role} onChange={(e)=>setNewUser(prev=>({...prev, role: e.target.value}))}>
                            <option value="student">student</option>
                            <option value="admin">admin</option>
                        </select>
                    </div>
                    <div>
                        <label>Access: </label>
                        <select value={newUser.access} onChange={(e)=>setNewUser(prev=>({...prev, access: e.target.value}))}>
                            <option value="true">True</option>
                            <option value="false">False</option>
                        </select>
                    </div>
                    <button type="submit">Add</button>
                </form> */}
                <div className='all-users'>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Access</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userData?.map((user,i) =>(
                                <tr key={i}>
                                    <td>{user.id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.role}</td>
                                    <td>{user.access ? <button className="revoke-btn" onClick={()=>revoke(user.id)}>Revoke Access</button> : <button className="grant-btn" onClick={()=>grant(user.id)}>Grant Access</button>}</td> 
                                    <td><button onClick={()=>setOpenDeleteModal({userName: user.name, open: true, id: user.id})}><FontAwesomeIcon className="trash-icon" icon={faTrash} /></button></td>                               
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='history'>
            <h3>History</h3>
            <button className='filter' onClick={()=>setOpenFilterModal(true)}>Filter</button>
            <button className='filter' onClick={()=>undoFilter()}>Undo Filter</button>
                <div className='all-users'>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>In/Out</th>
                                <th>Date</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history?.map((event,i) =>{
                            const date = new Date(event.time._seconds *1000).toLocaleDateString();
                            const time = new Date(event.time._seconds *1000).toLocaleTimeString()
                            return (
                                <tr key={i}>
                                    <td>{event.id}</td>
                                    <td>{event.name}</td>
                                    <td>{event.action}</td>
                                    <td>{date}</td>
                                    <td>{time}</td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        {openFilterModal &&
            <div className='filter-modal'>
                <h3>Filter</h3>
                <div className='filter-option'>
                    <label>Id</label>
                    <input onChange={(e)=>setFilter(prev=>({...prev, id: e.target.value}))} value={filter.id}></input>
                </div>
                <div className='filter-option'>
                    <label>Name</label>
                    <input onChange={(e)=>setFilter(prev=>({...prev, name: e.target.value}))} value={filter.name}></input>
                </div>
                <div className='filter-option'>
                    <label>Action</label>
                    <select name="cars" id="cars" onChange={(e)=>setFilter(prev=>({...prev, action: e.target.value}))} value={filter.action}>
                        <option value="">*select*</option>
                        <option value="logout">logout</option>
                        <option value="login">login</option>
                    </select>
                </div>
                <div className='filter-option'>
                    <label>Date</label>
                    <input placeholder="m/d/yyyy" onChange={(e)=>setFilter(prev=>({...prev, date: e.target.value}))} value={filter.date}></input>
                </div>
                <div className='filter-option'>
                    <label>Time</label>
                    <input placeholder="h:m:s PM" onChange={(e)=>setFilter(prev=>({...prev, time: e.target.value}))} value={filter.time}></input>
                </div>
                <button className='filter-button' onClick={()=>setOpenFilterModal(false)}>Close</button>
                <button className='filter-button' onClick={()=>filterHistory()}>Go</button>
            </div>
        }
        {openDeleteModal.open && 
        <div className='delete-modal'>
            <h3>Are you sure you want to remove '{openDeleteModal.userName}' from SUN Labs</h3>
            <button className="delete-user-btn" onClick={()=>{removeUser(openDeleteModal.id);setOpenDeleteModal({open: false, id: '', userName: ''})}}>Yes</button>
            <button className="delete-user-btn"  onClick={()=>setOpenDeleteModal({open: false, id: '', userName: ''})}>Cancel</button>
        </div>
        }
        {openAddUserModal &&
            <form className='add-user' onSubmit={(e)=>addUser(e)}>
                <h3>Add User</h3>
                <div className='add-user-field'>
                    <label>Name: </label>
                    <input value={newUser.name} onChange={(e)=>setNewUser(prev=>({...prev, name: e.target.value}))}></input>
                </div>
                <div className='add-user-field'>
                    <label>Role: </label>
                    <select value={newUser.role} onChange={(e)=>setNewUser(prev=>({...prev, role: e.target.value}))}>
                        <option value="student">student</option>
                        <option value="admin">admin</option>
                    </select>
                </div>
                <div className='add-user-field'>
                    <label>Access: </label>
                    <select value={newUser.access} onChange={(e)=>setNewUser(prev=>({...prev, access: e.target.value}))}>
                        <option value="true">True</option>
                        <option value="false">False</option>
                    </select>
                </div>
                <button type="submit">Add</button>
                <button type="button" onClick={()=>setOpenAddUserModal(false)}>Close</button>
             </form>
        }
    </div>
  )
}
