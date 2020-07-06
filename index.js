const fs = require('fs');

// Twitch
const TwitchClient = require('twitch');
const ChatClient = require('twitch-chat-client');

// Stuff
const { token, client } = require('./config.json');

const { access_token, refresh_token } = require('./creds.json');

let users = [];
let usersTimeout = [];



class User {
	constructor(username) {
		this.username = username;
	}

	timeout() {
		usersTimeout.push(this.username);

		setTimeout(() => {
			usersTimeout.slice(indexOf(this.username, 0));
		}, 1200000);
	}

}



async function start() {
	const twitchClient = TwitchClient.withCredentials(client, access_token, undefined, {
		token,
		refresh_token
	});
	const chatClient = ChatClient.forTwitchClient(twitchClient, { channels: ['dreaddoll3d'] });
	await chatClient.connect();

	
	
	chatClient.onPrivmsg(async (channel, user, message) => {

		user = '@' + user;

		if(message == '!очередь') {

			if(!users.length) {
				chatClient.say(channel, 'Очередь пустая.');
				return;
			}
			
			console.log(users);
			for(let i = 0; i < users.length; i++) {
				chatClient.say(channel, (i + 1) + '. ' + users[i]);
			}

			
		} else if(message == '!хочу') {
			if(users.includes(user)) {
				chatClient.say(channel, 'Ты уже в очереди.');
				return;
			}

			if(usersTimeout.includes(user)) {
				chatClient.say(channel, 'Вы ещё не готовы вступить в очередь.');
				return;
			}

			const newUser = new User(user);

			newUser.timeout();
			users.push(newUser.username);

			const index = users.indexOf(newUser.username) + 1;
			chatClient.say(channel, `Вы добавлены в очередь, ваша позиция: ${index}`);
		} else if(message.split(' ')[0] == '!удалить') {

			const mods = await chatClient.getMods(channel);

			if(!mods.includes(user.slice(1))) {
				chatClient.say(channel, 'Для этого нужны права модератора.');
				return;
			}

			let args = message.split(' ');

			if(!args[1]) {
				chatClient.say(channel, '!удалить @пользователь');
				return;
			} else {
				if(!users.includes(args[1])) {
					chatClient.say(channel, 'Этот пользователь не состоит в очереди.');
					return;
				}

				users.splice(users.indexOf(args[1], 0));
				chatClient.say(channel, 'Пользователь ' + args[1] + ' удалён.');
			}

		} else if(message == '!очистить') {
			const mods = await chatClient.getMods(channel);

			if(!mods.includes(user)) {
				chatClient.say(channel, 'Для этого нужны права модератора.');
				return;
			} else {
				users = [];
				chatClient.say(channel, 'Очередь очищена.');
			}
		}
	})

}

start();


