const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express().use(bodyParser.json());

const PAGE_ACCESS_TOKEN = 'EAB3iEM4N3iUBOZC6y4Kz2e8KBS4DWgkzmESI7rDw7GpZBful3aKZCUyAVxoicAZBVtNtdEtex5r922ywA548aS561OlNgFdaNSE17vcILVpuN0Xs9vO4cbYzhUaZBZAZARH6F6nmqqOFgFo9vpX5V7KrSn1XEilExLBne17Ujbf33INxWfCZAEgKpUXb8eKoSkuWeHNPRRMXDzcAxgpagwZDZD';
const VERIFY_TOKEN = '123';

app.listen(80, () => console.log('webhook is listening on 80'));

app.post('/webhook', (req, res) => {
  let body = req.body;
  console.log(body);

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      let webhookEvent = entry.messaging[0];
      console.log(webhookEvent);

      let senderPsid = webhookEvent.sender.id;
      console.log('Sender PSID: ' + senderPsid);

      if (webhookEvent.message) {
        handleMessage(senderPsid, webhookEvent.message);
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
      "text": `${gerarTextoAleatorio()}`
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


callSendPG(8918987148164956, "sdf..");
// Sends response messages via the Send API
function callSendPG(senderPsid, response) {
  // The page access token we have generated in your app settings
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

  // Construct the message body
  let requestBody = {
    recipient: {
      id: senderPsid,
    },
    messaging_type: "RESPONSE",
    message: {
      text: response,
    },
  };

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v21.0/518428884845337/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: requestBody,
    },
    (err, _res, _body) => {
      if (!err) {
        console.log("Message sent!" + err);
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}


function gerarTextoAleatorio() {
    const palavras = [
        "a", "o", "e", "do", "da", "em", "um", "para", "com", "não", "uma", "os", "no", "se", "na", 
        "por", "mais", "as", "dos", "como", "mas", "foi", "ao", "ele", "das", "à", "seu", "sua", 
        "ou", "quando", "muito", "há", "nos", "já", "está", "eu", "também", "só", "pelo", "pela", 
        "até", "isso", "ela", "entre", "depois", "sem", "mesmo", "aos", "seus", "quem", "nas", 
        "me", "esse", "eles", "estão", "você", "tinha", "foram", "essa", "num", "nem", "suas", 
        "meu", "às", "minha", "têm", "numa", "pelos", "elas", "havia", "seja", "qual", "será", 
        "nós", "tenho", "lhe", "deles", "essas", "esses", "pelas", "este", "fosse", "dele", "tu", 
        "te", "vocês", "vos", "lhes", "meus", "minhas", "teu", "tua", "teus", "tuas", "nosso", 
        "nossa", "nossos", "nossas", "dela", "delas", "esta", "estes", "estas", "aquele", "aquela", 
        "aqueles", "aquelas", "isto", "aquilo", "estou", "está", "estamos", "estão", "estive", 
        "esteve", "estivemos", "estiveram", "estava", "estávamos", "estavam", "estivera", "estivéramos"
    ];

    let texto = "";
    while (texto.length < 200) {
        let palavra = palavras[Math.floor(Math.random() * palavras.length)];
        if ((texto + " " + palavra).length <= 200) {
            texto += (texto ? " " : "") + palavra;
        } else {
            break;
        }
    }
    return texto;
}

console.log(gerarTextoAleatorio());
