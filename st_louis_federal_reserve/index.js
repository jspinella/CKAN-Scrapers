const amqp = require('amqplib/callback_api');
const indpro = require('./indpro');

const queue = 'centralExecutive';
const connection = 'amqp://usdk:usdk@3.15.228.7';

const organizationTitle = 'St. Louis Federal Reserve';
const organizationDescription = 'The Federal Reserve Bank of St. Louis, a member of the Federal Reserve Banking System of the United States.';
const organizationImageUrl = 'https://d32ogoqmya1dw8.cloudfront.net/images/econ/fred_logo.png';

// send scraped data to RabbitMQ
sendMessage = (msg) => {
    amqp.connect(connection, function (error0, connection) {
        if (error0)
            throw error0
        connection.createChannel(function (error1, channel) {
            if (error1)
                throw error1;

            channel.assertQueue(queue, {
                durable: true
            })

            channel.sendToQueue(queue, Buffer.from(msg))
            console.log(" [x] Sent %s", msg)
        })
    })
}

//foreach scraper, scrape and send off message 
(async () => {
    await indpro.Scrape().then(result => {
        result.organizationTitle = organizationTitle;
        result.organizationDescription = organizationDescription;
        result.organizationImageUrl = organizationImageUrl;

        sendMessage(JSON.stringify(result))
    });
})()