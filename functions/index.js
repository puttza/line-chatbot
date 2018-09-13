const functions = require('firebase-functions');
const request = require('request-promise');
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.webhook = functions.https.onRequest((request, response) => {
//  response.send("Hello From Firebase!");
// });

// let reply_token = req.body.events[0].replyToken;
// let msg = req.body.events[0].message.text;
// let msg_event = req.body.events[0].message.type;
// let uid = req.body.events[0].source.userId;

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';
const LINE_HEADER = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer P+JYcbV6AXSZNMxmgdOyMIwnRMIae8P6w9nneTvgpgsK8M5xH868zi3BFAHfMOJYBdmrIuLlg/w3Ey8ns8/bi9Q4Z2LLP8Nr8ImSaEmUOmmJdQLrNRxb3DRziKGVEZt33pbPfWMx7dPSK9ocGY2lpgdB04t89/1O/w1cDnyilFU='
};

exports.webhook = functions.https.onRequest((req, res) => {

    /** echo bot */
    // if (req.body.events[0].message.type !== 'text') {
    //     return;
    // }
    // reply(req.body);

    /** Send message */
    // sendMessage("Hello World!!!", req.body);

    /** Send weather api */
    return request({
        method: `GET`,
        uri: `https://api.openweathermap.org/data/2.5/weather?units=metric&type=accurate&id=1153671&appid=bacacc196af334f7e3bbd8e564cf104f`,
        json: true
    }).then((response) => {
        const message = `City: ${response.name}\nWeather: ${response.weather[0].description}\nTemperature: ${response.main.temp}`;
        return push(res, message, req.body);
    }).catch((error) => {
        return res.status(500).send(error);
    });


});

const push = (res, msg, bodyResponse) => {
    return request({
        method: `POST`,
        uri: `${LINE_MESSAGING_API}/push`,
        headers: LINE_HEADER,
        body: JSON.stringify({
            to: bodyResponse.events[0].source.userId,
            messages: [
                {
                    type: `text`,
                    text: msg
                }
            ]
        })
    }).then(() => {
        return res.status(200).send(`Done`);
    }).catch((error) => {
        return Promise.reject(error);
    });
};

const reply = (bodyResponse) => {
    return request({
        method: `POST`,
        uri: `${LINE_MESSAGING_API}/reply`,
        headers: LINE_HEADER,
        body: JSON.stringify({
            replyToken: bodyResponse.events[0].replyToken,
            messages: [
                {
                    type: 'text',
                    text: bodyResponse.events[0].message.text
                }
            ]
        })
    });
};


const sendMessage = (message, bodyResponse) => {
    let token = bodyResponse.events[0].replyToken;
    let body = JSON.stringify({
        type: 'message',
        replyToken: token,
        messages: [{
            type: "text",
            text: message
        }]
    });

    return new Promise((resolve, reject) => {
        request.post({
            url: 'https://api.line.me/v2/bot/message/reply',
            headers: LINE_HEADER,
            body: body
        }, (err, response, body) => {
            console.log('[Response] pushMessage: ' + response);
            console.log('[Body] pushMessage: ', body);
            resolve(response);
        });
    });
};