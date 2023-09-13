const express = require('express')
const app = express();
const cors = require('cors');
const db = require('./firebase')
const { FieldValue } = require('firebase-admin/firestore');
const bodyParser = require('body-parser');
const path = require('path');


app.use(express.static(path.join(__dirname + "/build")));

app.use(cors());
app.use(bodyParser.json());


app.get("/checkUserExist/:id", async (req,res) => {
    const { id } = req.params
    try {
        const userRef = db.collection("Users").doc(id)
        const userDoc = await userRef.get()
        if (userDoc.exists) {
            const {role, access} = userDoc.data()
            res.json({userExists : true, userRole: role, hasAccess: access})
        }
        else {
            res.json({userExists: false})
        }
    }
    catch(error) {
        console.log(error);
    }
})
app.post('/revoke', (req,res)=>{
    try {
        const {id} = req.body
        const userRef = db.collection("Users").doc(id)
        userRef.update({
            access: false
        })
    }catch(error){
        console.log(error)
    }
})
app.post('/grant', (req,res)=>{
    try {
        const {id} = req.body
        const userRef = db.collection("Users").doc(id)
        userRef.update({
            access: true
        })
    }catch(error){
        console.log(error)
    }
})
app.post('/userLoginAndLogout', async(req,res)=>{
    try{
        const {id, action} = req.body;
        const userRef = db.collection("Users").doc(id)
        const userDoc = await userRef.get()
        const userName = userDoc.data().name
        db.collection('History').add(
            {
                action: action,
                time: FieldValue.serverTimestamp(),
                id: id,
                name: userName
            }
        )
        res.json({success: true})
    }catch (error) {
        console.log(error)
        res.json({success: false})
    }
})
app.post('/addUser', async(req,res)=>{
    try {
        const {access, name, role} = req.body;
        const newUser = db.collection('Users').add(
            {
                access: access,
                name: name,
                role: role,
            }
        )
        const id = (await newUser).id
        res.json({id:id})
    }catch (error){
        console.log(error)
    }
})
app.post('/removeUser', async(req,res)=>{
    try {
        const {id} = req.body
        await db.collection('Users').doc(id).delete();
        res.json({success: true})
    }catch (error){
        res.json({success: false})
        console.log(error)
    }
})
app.get('/getAllUsers', async (req,res) => {
    try {
        await db.collection('Users').get()
        .then(querySnapshot => {
            let users = [];
            querySnapshot.docs.map(doc => {
                let res = doc.data()
                users.push(
                    {
                        role: res.role,
                        name: res.name,
                        access: res.access,
                        id: doc.id,
                    }
                )
            });
            res.json({users: users})
        });
    }
    catch(error) {
        console.log(error)
    }
});
app.get('/getHistory', async (req,res) => {
    try {
        await db.collection('History').get()
        .then(querySnapshot => {
            let history = [];
            querySnapshot.docs.map(doc => {
                let res = doc.data()
                history.push(res)
            });
            res.json({history: history})
        });
    }
    catch(error) {
        console.log(error)
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
  });

app.listen(3001)