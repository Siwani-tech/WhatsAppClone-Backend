//importing
import dotenv from 'dotenv';
import path from 'path';

// dotenv.config({path: path.join(__dirname, '..', '.env')});
dotenv.config({path: path.join('.env')});

import mongoose from "mongoose";
import express  from "express";
import Pusher from 'pusher';
import Messages from './dbMessages.js';
import cors from 'cors';



//app config
const app=express();//it allow us to write api 

const port=process.env.PORT || 3002;

const pusher = new Pusher({
    appId: "1358254",
    key: "1b729c80791a14a9e64c",
    secret: "ddd14032d7bb66357655",
    cluster: "eu",
    useTLS: true
  });

//Pusher
const db=mongoose.connection;
db.once('open',()=>{
    console.log("DB is connected");

    const msgCollection=db.collection('messagecontents')
    const changeStream=msgCollection.watch();

    changeStream.on('change',(change)=>{
        console.log(change);

        if(change.operationType === 'insert'){
            const messageDetails=change.fullDocument;
            pusher.trigger('messages','inserted',{
                message: messageDetails.message,
                name: messageDetails.name,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received
            });
        }else{
            console.log('error tiggering pusher')
        }
    });
});



//middleware
app.use(cors())

app.use(express.json());
//securing msg

app.use((req,res,next)=>{
    res.setHeader("Acess-Control-allow-Origin","*");
    res.setHeader("Acess-Control-allow-Headers","*");
    next();
})


//db config
const connection_url=process.env.key;


mongoose.connect(connection_url, {

    useNewUrlParser: true, 
    
    useUnifiedTopology: true 
    
    }, err => {
    if(err) throw err;
    console.log('Connected to MongoDB!!!')
    });

//code

//api routes

app.get('/',(req,res)=> res.status(200).send("hello world"));

app.get('/messages/sync',(req,res)=>{
    Messages.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
});

app.post('/messages/new',(req,res)=>{
    const dbMessages=req.body;
    Messages.create(dbMessages,(err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data);
        }
    })
});

//listener

app.listen(port,()=>console.log(`listining at localhost:${port}`));









