import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser'
import {GoogleGenerativeAI} from '@google/generative-ai';
const app= express()
import { fileURLToPath } from 'url';
import path from 'path';
import axios from 'axios'


const userMemories= new Map()


const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename);
app.use(express.static(path.join(__dirname,'public')))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))

const genAI= new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const chatHistory= new Map()

function saveMemory(id,key,value){
    if(!userMemories.has(id)){
        userMemories.set(id,{});
    }
    const userMemory=userMemories.get(id);
    userMemory[key]=value;
}
function recallMemory(id,key){
    const userMemory=userMemories.get(id);
    return userMemory ? userMemory[key]:null;
}

//intialize chatbot 

async function initChat(id) {
    const model=genAI.getGenerativeModel({model:"gemini-1.5-flash"});
    const chat =model.startChat({
        history:[],
        generationConfig:{
            maxOutputTokens:1000,
            temperature:0.5,//higher the value higher the random responses max=>1.0 min=>0.1 //it explains the coldness of the bot //the lower temperature provides more probable and deterministic words
            topK:40,// k most probable tokens(words/punctuation/...etc) after all the tokens are generated
            topP:0.8// selects the subset of tokens with cumulative probability just higher than 0.8 

        }});
        chatHistory.set(id,chat);
        return chat; 
}


async function generateResponse(message,id) {
    
    try{
        let chat = chatHistory.get(id)
        if(!chat){
            chat=await initChat(id);
        }
        const result = await chat.sendMessage(message);
        
        const response= await result.response;
        return response.text();
        
    }catch(error){
        console.error("Couldn't generate response. Error:",error);
        return "I apologise I encountered an error please try again";
    }
    
}
app.post('/chat',async(req,res)=>{
    try{
        const {message,id}=req.body;
        const response= await generateResponse(message,id||'default');
        res.json({response})
    }catch(error){
        console.error("Chat endpoint error:",error)
        res.status(500).json({error:"Endpoint error detected, please try again later"});
    }
});
app.get('/',(req,res)=>{
    res.sendFile(path.join(dirname,'public','index.html'));
});
app.listen(3000,()=>{
    console.log("port 3000 is ready to kill");
})