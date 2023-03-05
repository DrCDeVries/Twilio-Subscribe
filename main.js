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
  try{
    for (let i = 0; i < numbers.length; i++) {
    const toNumber = numbers[i];
    twiml.message({ to: toNumber }, message);
  }
  twiml.message({ to: Admin }, `Message Sent`);
  console.log(` ${message} was sent to ${numbers.length} person`);
  Confirmation = false;
  isMessage = false;}
  catch(error){
    console.log(error);
  }
}
async function sendMMs(mediaArray, numbers, twiml){
  try{

       for (let i = 0; i < numbers.length; i++) {
      numberindex = numbers[i];
      for (let i = 0; i < mediaArray.length; i++) {
          twiml.message({ to: numberindex }).media(mediaArray[i]);
      }

      Confirmation = false;
      isMessage = false;
    }
    console.log(` image was sent to ${numbers.length} person`);
  }catch(errror){
    console.log(error);
  }
}

async function sendMessageMMS(lastMessage, numbers, mediaArray, twiml){
  try{
        // twiml.message({ to: Admin }, `Message Sent`);
        
        for (let i = 0; i < numbers.length; i++) {
            numberindex = numbers[i];
            for (let i = 0; i < mediaArray.length; i++) {
                twiml.message({ to: numberindex }).media(mediaArray[i]);
            }
            
            twiml.message({ to: numberindex }, lastMessage);
          }
          console.log(` ${lastMessage} was sent to ${numbers.length} person`);
          Confirmation = false;
          isMessage = false;
  }catch(error){
    console.log(error);
  }

}






app.post('/sms', async (req, res, callback) => {
  var counter = 0;
  

  
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
        if(messageContent.toLowerCase() == "mute"){
            for (let i = 0; i < numbers.length; i++) {
                if (numbers[i] === fromNumber) {
                  numbers.splice(i, 1);
                  fs.writeFile('numbers.json', JSON.stringify(numbers), 'utf8', (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                });
                  twiml.message({ to: fromNumber }, `You Are No Longer Subscribed`);
                  i--; // update the loop counter to avoid skipping the next element
                }
              }

        }else{
        twiml.message({ to: fromNumber}, `Your Already Subscribed reply MUTE to Unsubscribe`);
    }
      } else {

        numbers.push(fromNumber);
        fs.writeFile('numbers.json', JSON.stringify(numbers), 'utf8', (err) => {
          if (err) {
              console.error(err);
              return;
          }
      });
        twiml.message({ to: fromNumber }, `You Are Now Subscribed Reply MUTE at any time to stop receiving messages`);
        
      }

      
      
      
  }
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
  callback(null, twiml);
});


http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});