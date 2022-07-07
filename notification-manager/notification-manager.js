const amqp = require('amqplib/callback_api')
const CONN_URL = "amqps://deeeuvun:stX7p-YHmF69-lEYRKpO0dushjDbEAo_@beaver.rmq.cloudamqp.com/deeeuvun"
let ch = null;
amqp.connect(CONN_URL, function (err, conn) {
   conn.createChannel(function (err, channel) {
      ch = channel;
      console.log("Connected to rabbitmq")
   });
});

const publishToQueue = async (queueName, data) => {
    ch.sendToQueue(queueName, new Buffer(data));
}

process.on('exit', (code) => {
    ch.close();
    console.log(`Closing rabbitmq channel`);
});

module.exports={publishToQueue}