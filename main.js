const http = require('http');
const express = require('express');
const Twilio = require('twilio');
const { urlencoded } = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const fs = require('fs');
const Admin = "";
var Confirmation = false;
const mediaArray = [];
const app = express();
app.use(urlencoded({ extended: false }));

async function sendMessage(message, numbers, twiml){
    for (let i = 0; i < numbers.length; i++) {
    const toNumber = numbers[i];
    try{
    twiml.message({ to: toNumber }, message);
    }catch(error){
      console.error(error);
      twiml.message({to:Admin}, `error:${error} , message not sent`)
    }
  }
  twiml.message({ to: Admin }, `Message Sent`);
  console.log(` ${message} was sent to ${numbers.length} person`);
  Confirmation = false;
  isMessage = false;
}
async function sendMMs(mediaArray, numbers, twiml){


    for (let i = 0; i < numbers.length; i++) {
      try{
        numberindex = numbers[i];
        for (let i = 0; i < mediaArray.length; i++) {
            twiml.message({ to: numberindex }).media(mediaArray[i]);
        }
      }
      catch(error){
        console.error(error);
        twiml.message({to:Admin}, `error:${error} , message not sent`)
    }
      Confirmation = false;
      isMessage = false;
    }


}

async function sendMessageMMS(lastMessage, numbers, mediaArray, twiml){

        // twiml.message({ to: Admin }, `Message Sent`);
        
        for (let i = 0; i < numbers.length; i++) {
          try{
            numberindex = numbers[i];
            for (let i = 0; i < mediaArray.length; i++) {
                twiml.message({ to: numberindex }).media(mediaArray[i]);
            }
            
            twiml.message({ to: numberindex }, lastMessage);
          }
          catch(error){
            console.error(error);
            twiml.message({to:Admin}, `error:${error} , message not sent`)
          }
        }
          Confirmation = false;
          isMessage = false;


}






app.post('/sms', async (req, res, callback) => {
  

  
 let twiml = new Twilio.twiml.MessagingResponse();

 const lastMessage = await fs.readFileSync('lastMessage.text').toString();
 const numbers = await JSON.parse(fs.readFileSync('numbers.json').toString());
 const fromNumber = req.body.From;
 const messageContent = req.body.Body.trim();
 const messageMedia = req.body.NumMedia;
 if(fromNumber == Admin) {

if (Confirmation == true && messageContent.toLowerCase() == "yes"){
    if(isMedia == false && isMessage == true){

      sendMessage(lastMessage, numbers, twiml );


    }else if(isMedia == true && isMessage == false){
        // twiml.message({ to: Admin }, `Message Sent`);
     sendMMs(mediaArray, numbers, twiml);
    }
else if(isMedia == true && isMessage == true)
{
    sendMessageMMS(lastMessage, numbers, mediaArray, twiml);
    }
}  else if( Confirmation == false){
    if(messageContent.length !== 0){

      fs.writeFile('lastMessage.text', messageContent, 'utf8', (err) => {
          if (err) {
              console.error(err);
              return;
          }
      isMessage = true
      });
      
    }else{
      isMessage = false;
    }
    Confirmation = true;
    if (messageMedia > 0) {
        isMedia = true;
        console.log(`Received ${messageMedia} media files`);
        mediaArray.length = 0;
        for (let i = 0; i < messageMedia; i++) {
            const mediaUrls = req.body[`MediaUrl${i}`];
            // Do something with the media content (save to disk, forward to another service, etc.)
            mediaArray.push(mediaUrls);
          }
      } else{
        isMedia = false;
        mediaArray.length = 0;
      }

    twiml.message({ to: Admin }, `respond Yes to send message or respond anything else to cancel `);
    console.log('Waiting Confirmation');
} 
else if (Confirmation == true && messageContent.toLowerCase() !== "yes" ){
    console.log('Message Canceled');
    twiml.message({ to: Admin }, `Message Cancelled`);
    Confirmation = false;
}
 }else{
    if (numbers.includes(fromNumber)) {
        if(messageContent.toLowerCase() == "stop"){
            for (let i = 0; i < numbers.length; i++) {
                if (numbers[i] === fromNumber) {
                  numbers.splice(i, 1);
                  fs.writeFile('numbers.json', JSON.stringify(numbers), 'utf8', (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                });
                  console.log(`${fromNumber} was removed from message list`);
                  i--; 
                }
              }

        }else{
        twiml.message({ to: fromNumber}, `Your Already Subscribed reply STOP to Unsubscribe`);
    }
      } else {

        numbers.push(fromNumber);
        fs.writeFile('numbers.json', JSON.stringify(numbers), 'utf8', (err) => {
          if (err) {
              console.error(err);
              return;
          }
      });
        twiml.message({ to: fromNumber }, `You Are Now Subscribed Reply STOP at any time to stop receiving messages`);
        
      }

      
      
      
  }
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
  callback(null, twiml);
});


http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});