import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import axios from"axios" ; 
import express from "express";

dotenv.config();

const app = express();
const port = 3001;

app.listen(port , ()=>{
    console.log(`Server running live at localhost:${port}`);
});

app.get("/",(req,res)=>{
    res.send("Server working well !! ");
});

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

bot.on('message', async (msg) => {
const chatId = msg.chat.id;
const userPrompt = msg.text;

    var Hi = "hi";
    if (userPrompt.toString().toLowerCase().indexOf(Hi) === 0) {
    bot.sendMessage(chatId,"Hello Harsh");
    }
    try {
        const url = 'https://api.openai.com/v1/chat/completions';
        const headers = {
            'Content-type' : 'application/json',
            'Authorization' : `Bearer ${process.env.API_KEY}`,
          };
          const data = {
        //model: "gpt-4",
          model : "gpt-3.5-turbo",
          messages: [{"role": "user", "content": userPrompt}],
          };
          const response = await axios.post(url, data, { headers: headers });
          const botResponse =  response.data.choices[0].message.content ;
          bot.sendMessage(chatId , botResponse);
          console.log(botResponse);
    } catch (error) {
        console.log("error");
    }
});


bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId,"Welcome to the  teleGPT, Powered by OpenAI GPT-4 .\nType  anything to get started." , {
    });
})
