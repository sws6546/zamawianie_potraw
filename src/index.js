const express = require('express')
const bodyParser = require('body-parser')
const amqp = require('amqplib/callback_api');


const app = express()
const port = 3000
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()) // for parsing application/json
app.use(express.json());

app.get('/', (req, res) => {
    res.render('pages/index');
})

let channel;
const queue = 'orders';
amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function (error1, ch) {
        if (error1) {
            throw error1;
        }
        ch.assertQueue(queue, {
            durable: true
        });
        channel = ch;
    });
});

app.post("/orderMeal", (req, res) => {
    const orderData = req.body
    const msg = JSON.stringify(orderData)

    if (!channel) {
        return res.status(500).send('Channel not ready');
    }

    channel.sendToQueue(queue, Buffer.from(msg));
    console.log(msg);
    res.render("pages/index");
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})