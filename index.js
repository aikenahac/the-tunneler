const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json')

require('dotenv').config();

const TOKEN = process.env.TOKEN;

console.log("TOKEN: " + TOKEN);

console.log("Tunnel: " + config.tunnel);

client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}`)
	config.tunnel.forEach(channelId => initWebhooks(channelId))
});

client.on('message', async message => {
	try {
		if (!config.tunnel.includes(message.channel.id) || message.webhookID) return;

		const channels = config.tunnel.filter(id => id !== message.channel.id)

		channels.forEach(async channelId => {
			const channel = client.channels.cache.get(channelId);

			const webhooks = await channel.fetchWebhooks()
			const myWebhooks = webhooks.filter(webhook => {
                if (!webhook.owner) return;
                console.log("Webhook owner: " + webhook.owner);
                console.log("Client user: " + client.user);
    
                return webhook.owner.id === client.user.id && webhook.name === 'The Tunneler';
            })

            let messageToSend;
            let imagesArray = [];

            if (message.attachments.size > 0) {
                message.attachments.forEach(attachment => {
                    const url = attachment.url;

                    imagesArray.push(url);
                })
            }

            if (imagesArray[0] === undefined) {
                messageToSend = message.content;
            } else if((message.content === null || message.content === '') && imagesArray[0] !== undefined) {
                messageToSend = imagesArray;
            } else {
                messageToSend = message.content + "\n" + imagesArray;
            }

            console.log(messageToSend);

			myWebhooks.first().send(messageToSend || '.', {
				username: message.author.username,
				avatarURL: message.author.avatarURL(),
				embeds: message.embeds
			})
            console.log("Sent message!");
		})
	} catch (error) {
		console.log(error)
	}
})

client.login(TOKEN);

async function initWebhooks(channelId) {	
	try {
		const channel = client.channels.cache.get(channelId)
		const webhooks = await channel.fetchWebhooks()
		const myWebhooks = webhooks.filter(webhook => {
            if (!webhook.owner) return;
            console.log("Webhook owner: " + webhook.owner);
            console.log("Client user: " + client.user);

            return webhook.owner.id === client.user.id && webhook.name === 'The Tunneler';
        })

		myWebhooks.forEach(webhook => webhook.delete(`Oops`));

		await channel.createWebhook('The Tunneler', {
			avatar: 'https://cdn.discordapp.com/attachments/785272082136694824/816052706690334750/zerotwo.jpg',	
		})
	} catch (err) {
		console.log(`Error creating webhooks: \n${err}`);
	}
}