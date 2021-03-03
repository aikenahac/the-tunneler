const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json')

require('dotenv').config();

const TOKEN = process.env.TOKEN;

console.log("Tunnel: " + config.tunnel);

client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}`)
	config.tunnel.forEach(channelId => initWebhooks(channelId))
	client.user.setActivity(
		{
			name: 'anime <3',
			type: 'WATCHING'
		}
	);
});

client.on('message', async message => {
	if (!config.tunnel.includes(message.channel.id) || message.webhookID) return;

	const channels = config.tunnel.filter(id => id !== message.channel.id)

	channels.forEach(async channelId => {
		const channel = client.channels.cache.get(channelId);
		const serverName = message.guild.name;

		const webhooks = await channel.fetchWebhooks()
		const myWebhooks = webhooks.filter(webhook => {
			if (!webhook.owner) return;

			return webhook.owner.id === client.user.id && webhook.name === 'The Tunneler';
		})

		let messageToSend;
		const imagesArray = [];

		if (message.attachments.size > 0) {
			message.attachments.forEach(attachment => {
				const url = attachment.url;

				imagesArray.push(url);
			})
		}

		let member;

		try {
			member = await channel.guild.members.fetch(message.author.id);
		} catch (e) {
			console.log('User is not in this guild');
		}

		if (imagesArray[0] === undefined) {
			messageToSend = message.content;
		} else if((message.content === null || message.content === '') && imagesArray[0] !== undefined) {
			messageToSend = imagesArray;
		} else {
			messageToSend = message.content + "\n" + imagesArray;
		}

		if (messageToSend.includes('@everyone')) {
			console.log(`${message.author.tag} tried to mention @everyone...`);
			messageToSend = "Ne ne boš mentionu everyone. Naslednc bo ban svinja"
			message.channel.send("Ne ne boš mentionu everyone. Naslednc bo ban svinja");
			console.log(`Checked msg: ${messageToSend}`);
		} else if (messageToSend.includes('@here')) {
			console.log(`${message.author.tag} tried to mention @everyone...`);
			messageToSend = "Ne ne boš mentionu here. Naslednc bo ban svinja"
			message.delete();
			message.channel.send("Ne ne boš mentionu here. Naslednc bo ban svinja");
			console.log(`Checked msg: ${messageToSend}`);
		}

		console.log(`${message.author.username} [${serverName}] > ${messageToSend}`);
		
		myWebhooks.first().send(messageToSend || 'No content provided', {
			username: member ? `${member.nickname}  [${serverName}]` : `${message.author.username} [${serverName}]`,
			avatarURL: message.author.avatarURL(),
			embeds: message.embeds,
		})
	})
})

client.login(TOKEN);

async function initWebhooks(channelId) {	
	try {
		const channel = client.channels.cache.get(channelId)
		const webhooks = await channel.fetchWebhooks()
		const myWebhooks = webhooks.filter(webhook => {
            if (!webhook.owner) return;

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