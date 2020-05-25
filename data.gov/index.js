const amqp = require('amqplib/callback_api');
const scraper = require('./scraper');

const inboundQueue = 'scrapers.datagov';
const outboundQueue = 'centralExecutive';
const connection = 'amqp://usdk:usdk@ckan.dev.datajax.org';

// send scraped data to RabbitMQ
sendMessage = (msg) => {
    amqp.connect(connection, function (error0, connection) {
        if (error0)
            throw error0
        connection.createChannel(function (error1, channel) {
            if (error1)
                throw error1;

            channel.assertQueue(outboundQueue, {
                durable: true
            })

            channel.sendToQueue(outboundQueue, Buffer.from(msg))
            console.log(" [x] Sent %s", msg)
        })
    })
}

(async () => {
    //consume scrapers.datagov queue
    amqp.connect(connection, function (error0, connection) {
      if (error0)
          throw error0
      connection.createChannel(function (error1, channel) {
          if (error1)
              throw error1;
  
          channel.assertQueue(inboundQueue, {
              durable: true
          })

          channel.prefetch(1); // throttle!
  
          console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", inboundQueue);
          channel.consume(inboundQueue, function(msg) {
            console.log(" [x] Received %s", msg.content.toString());
            //scrape and send message to centralExecutive queue
            scraper.Scrape(msg.content.toString()).then(result => {      
              result && sendMessage(JSON.stringify(result))
              channel.ack(msg)
          })
          }, {
              noAck: false
            });
      })
    })
})()