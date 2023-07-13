import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import axios from"axios" ; 
import express from "express";
import moment from "moment-timezone";

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


async function lookupTime(location, name , chatId) {
        try {
            const response = await axios.get(`http://worldtimeapi.org/api/timezone/${location}`); 
            // Make a GET request to the World Time API with the 'location' value as the timezone.
            const { datetime } = response.data; // Destructure 'datetime' from the response to extract it.
            const dateTime = moment.tz(datetime, location).format("h:mmA");
            // Create a new date object using the specified timezone and format it in 12-hour time with AM/PM label.
            // console.log(`The current time in ${name} is ${dateTime}.`);
            const message = `The current time in ${name} is ${dateTime}.`; 
            bot.sendMessage(chatId, message);
            // Log the formatted time to the console.
        } catch (error) {
            console.error(error); //Log any errors that occur to the console.
        }
}





// telegram bots responds through this. 
bot.on('message', async (msg) => {
const chatId = msg.chat.id;
const userPrompt = msg.text;
try {
        const url = 'https://api.openai.com/v1/chat/completions';
        const headers = {
            'Content-type' : 'application/json',
            'Authorization' : `Bearer ${process.env.API_KEY}`,
          };
          const data = {
          model : "gpt-3.5-turbo",
          messages: [{"role": "user", "content": userPrompt}],
          functions : [{ // Define the 'lookupTime' function
            name: "lookupTime",
            description: "get the current time in a given location",
            parameters: { // Define the input parameters for the function
                type: "object", // The parameter is an object
                properties: { 
                    location: { // The 'location' property of the object is a required string
                        type: "string", // The 'location' property is a string value
                        description: "The location, e.g. Beijing, China. But it should be written in a timezone name like Asia/Shanghai"
                    },
                    name: {
                        type: "string",
                        description: "The location mentioned in the prompt. Example: Beijing, China."
                    }
                },
                required: ["location", "name"] // The 'location' property is required
            }
        }] , 
        function_call: "auto" 
          };
          const response = await axios.post(url, data, { headers: headers });
          const completionResponse = response.data.choices[0].message;
          const botResponse =  response.data.choices[0].message.content ; 

          if(!completionResponse.content) { // Check if the generated response includes a function call
            const functionCallName = completionResponse.function_call.name; 
            console.log("functionCallName: ", functionCallName);
    
            if(functionCallName === "lookupTime") { // If the function being called is 'lookupTime'
                const completionArguments = JSON.parse(completionResponse.function_call.arguments); // Extract the argument for the function call
                console.log("completionArguments: ", completionArguments);
    
                lookupTime(completionArguments.location,completionArguments.name , chatId); // Call the 'lookupTime' function with the specified location argument. 
            }

        }
else{
    bot.sendMessage(chatId , botResponse);
    console.log(botResponse);
}
    } catch (error) {
        console.log(error);
    }
});

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId,`Welcome ${msg.from.first_name} to teleGPT,Powered by OpenAI GPT-4.\nType  anything to get started.` , {
    });
})


