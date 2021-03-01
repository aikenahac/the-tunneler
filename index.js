const Discord = require('discord.js');
const { tunnel } = require('./config.json')

require('dotenv').config;

const client = new Discord.Client()
const token = process.env.TOKEN;

client.once('ready', () => {
	console.log(`${client.user} is running..`)
	tunnel.forEach(channelId => initWebhooks(channelId))
});

client.on('message', async message => {
	try {
		if (!tunnel.includes(message.channel.id) || message.webhookID) return;

		const channels = tunnel.filter(id => id !== message.channel.id)

		channels.forEach(async channelId => {
			const channel = client.channels.cache.get(channelId)

			const webhooks = await channel.fetchWebhooks()
			const webhook = webhooks.find(webhook => webhook.owner.id === client.user.id && webhook.name === 'The Tunneler')
			webhook.send(message.content || '', {
				username: message.author.username,
				avatarURL: message.author.avatarURL(),
				embeds: message.embeds
			})
		})
	} catch (error) {
		console.log(error)
	}
})

client.login(token);

async function initWebhooks(channelId) {	
	try {
		const channel = client.channels.cache.get(channelId)
		const webhooks = await channel.fetchWebhooks()
		const myWebhooks = webhooks.filter(webhook => webhook.owner.id === client.user.id && webhook.name === 'The Tunneler')
		myWebhooks.forEach(webhook => webhook.delete(`Oops`));

		await channel.createWebhook('The Tunneler', {
			avatar: 'https://cdn.discordapp.com/attachments/785272082136694824/816052706690334750/zerotwo.jpg',	
		})
	} catch (err) {
		console.log(`Error creating webhooks: \n${err}`);
	}
}
