const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const { OpenAI } = require("openai");

const app = express().use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

app.listen(process.env.PORT, () => console.log('webhook is listening on' + process.env.PORT));

app.post('/webhook', (req, res) => {
  let body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      let webhookEvent = entry.messaging[0];
      console.log(webhookEvent);

      let senderPsid = webhookEvent.sender.id;
      console.log('Sender PSID: ' + senderPsid);

      if (webhookEvent.message) {
        handleMessage(senderPsid, webhookEvent.message);
        //getGTP(senderPsid, webhookEvent.message);
      } else if (webhookEvent.postback) {
        handlePostback(senderPsid, webhookEvent.postback);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

app.get('/webhook', (req, res) => {
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

function handleMessage(senderPsid, receivedMessage) {
  let response;

  if (receivedMessage.text) {    
    response = {
      "text": `You sent the message: "${receivedMessage.text}".`
    };
  }  

  callSendAPI(senderPsid, response);
}

function handlePostback(senderPsid, receivedPostback) {
  let response;

  // Check if the postback's payload is 'GET_STARTED'
  if (receivedPostback.payload === 'GET_STARTED') {
    response = { "text": "Welcome to our service! How can we help you today?" };
    callSendAPI(senderPsid, response);
  }
}

function callSendAPI(senderPsid, response) {
  let requestBody = {
    "recipient": {
      "id": senderPsid
    },
    "message": response
  };

  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": requestBody
  }, (err, res, body) => {
    if (!err) {
      console.log('Message sent!');
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

/*


const client = new OpenAI({
  apiKey: process.env.TOKEN_GPT, // This is the default and can be omitted
});

async function getGTP(senderPsid,receivedMessage) {
  const result = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: receivedMessage.text}],
  });

 if (receivedMessage.text) {    
    response = {
      "text": `You sent the message: "${result.choices[0].message?.content}".`
    };
  }  

  callSendAPI(senderPsid, response);
  console.log(result.choices[0].message?.content);
}*/


