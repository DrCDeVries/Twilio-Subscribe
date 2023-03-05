const MessagingResponse = require('twilio').twiml.MessagingResponse;
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const array = ['https://cdn.pixabay.com/photo/2014/06/03/19/38/board-361516__340.jpg', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/SIPI_Jelly_Beans_4.1.07.tiff/lossy-page1-1200px-SIPI_Jelly_Beans_4.1.07.tiff.jpg'];
// configure body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/sms', (req, res) => {
  const twiml = new MessagingResponse();
  twiml.message({
    body: 'This is a test message',
    to: '+12694477392',
  }).media(array);
console.log('test');
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

app.listen(1337, () => {
  console.log('Listening on port 1337');
});
