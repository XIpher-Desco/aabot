/*
  A ping pong bot, whenever you send "ping", it replies "pong".
*/
// 開発メモ！
//removeListener(event, listener)	イベントハンドラの削除

// import the discord.js module
const Discord = require('discord.js');
// create an instance of a Discord Client, and call it bot
const bot = new Discord.Client();

const fs = require('fs');
var tokenJson = JSON.parse(fs.readFileSync('../token.json', 'utf8'));
const googleTranslateApiKey = tokenJson["googleTranslateApiKey"];
const discordToken = tokenJson["discordTokenNode"];
const googleTranslate = require('google-translate')(googleTranslateApiKey);

class TranslateChannels{
	constructor(){
		this.channels = [];
		const translateChannelsFileDir = "../translateChannels.json";

		//ファイルから翻訳Channelを読み込み
		fs.access(translateChannelsFileDir, function (err) {
			if (err) {
				if (err.code === 'ENOENT') {
					console.log('translateChannelsFileDir not exists!!');
				}
				else {
					console.error(err);
					process.exit(1);
				}
			}
			else {
				var translateChannelsFile = JSON.parse(fs.readFileSync(translateChannelsFileDir));
				this.channels = translateChannelsFile;
			}
		});
	};

	isTranslateChannel(channelId){
		return this.channels.indexOf(channelId) != -1;
	};
	addChannel(channelId){
		if(!this.isTranslateChannel(channelId)){
			this.channels.push(channelId);
		}
		this.saveTranslateChannels();
	};
	removeChannel(channelId){
		if(this.isTranslateChannel(channelId)){
			this.channels.splice((this.channels.indexOf(channelId),1));
		}
		this.saveTranslateChannels();
	};
	saveTranslateChannels(){
		const channelsJsonStr = JSON.stringify(this.channels);
		fs.writeFile(translateChannelsFileDir, channelsJsonStr);
	};
}

const translateChannels = new TranslateChannels();
//var translateChannels = [];

// the token of your bot - https://discordapp.com/developers/applications/me


// the ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted.
var generalChannel;//ジェネラルのチャンネル
var testcanChannel;//ボットテスト用サーバーのテストチャンネル（他チャンネルテスト用）
const regex_m = /\<[^\b\s]+/g; // removes mentions
const regex_w = /s^\s+|\s+$|\s+(?=\s)/g; // remove duplicate and trailing spaces	

LoginMonitoring = function(){

};
var LMC = new LoginMonitoring();//ログイン監視クラスのインスタンス化
bot.on('ready', () => {
	console.log('I am ready!');
	bot.channels.forEach((value, key , map) => {
		if(value.type ==='text' && value.name ==='general'){
			generalChannel = value;
		}
		if(value.type ==='text' && value.name ==='testcan'){
			testcanChannel = value;
		}
	});
	generalChannel.send('ボットがオンラインになりました');
	LMC.init(generalChannel,1);//ログイン監視クラスの初期化
	if(LMC.isMonitoring()!==0 && LMC.isMonitoringEvent()===0){
		LMC.setEventListener(bot);
		generalChannel.send('監視開始');
	}
});

// create an event listener for messages
bot.on('message', message => {
	// remove mention content
	var content = message.content.replace(regex_m,'').replace(regex_w,'').trim();
	if (content === 'とまと'){
		message.channel.send(':tomato:');
	}
	if (content === 'what is my id'){
		message.channel.send( message.author.username +'\'s id is '+message.author.id);
	}
	if (content === 'monitoring on'){
		message.channel.send(LMC.changeMonitoring(message.author.id,1));
	}
	if (content === 'monitoring off'){
		message.channel.send(LMC.changeMonitoring(message.author.id,0));
	}

	if (content === 'translate on'){
		if (message.author.id === '168036016333127680'){
			translateChannels.addChannel(message.channel.id);
			message.channel.send(message.channel.name + "を自動翻訳チャンネルとして登録しました。");
			// if(translateChannels.indexOf(message.channel.id) == -1){
			// 	translateChannels.push(message.channel.id);
			// 	message.channel.send(message.channel.name + "を自動翻訳チャンネルとして登録しました。");
			// }
		}
		else{
			message.channel.send("その操作は許可されていません。");
		}
	}
	if (content === 'translate off'){
		if (message.author.id === '168036016333127680'){
			translateChannels.removeChannel(message.channel.id);
			message.channel.send(message.channel.name + "を自動翻訳チャンネルから削除しました。");
			// if(translateChannels.indexOf(message.channel.id) != -1){
			// 	translateChannels.splice((translateChannels.indexOf(message.channel.id),1));
			// 	message.channel.send(message.channel.name + "を自動翻訳チャンネルから削除しました。");
			// }
		}
		else{
			message.channel.send("その操作は許可されていません。");
		}
	}

	//if (translateChannels.indexOf(message.channel.id) != -1 && bot.user.id !== message.author.id ){
	if (translateChannels.isTranslateChannel(message.channel.id) && bot.user.id !== message.author.id ){
		// 何言語かを検出
		googleTranslate.detectLanguage(content, function(err, detection) {
			console.log(err);
			console.log(detection);
			var translateLanguage = 'ja';
			if (detection.language == 'ja'){
				translateLanguage = 'en';
			}
			// 検出した言語が日本語以外なら翻訳
			googleTranslate.translate(content, translateLanguage, function(err, translation) {
				console.log(translation.translatedText);
				// メンション作成形式は<@!281131536655581186>
				// var userMention = "<@!"+message.author.id+">";
				var userMention = message.author.username;
				// 引用文作成
				var authorSaid = "\n```"+ content + '```\n'
				//var translatedText = 'You used language is ' + detection.language +"\n in Japanese - " + translation.translatedText;
				var translatedText = translation.translatedText;
				// message.reply(authorSaid + translatedText);
				message.channel.send(userMention + authorSaid + translatedText);
			});
		});
	}
});

// チャンネル制御クラス（許可とか）


//モニタリングclass(presence)

LoginMonitoring.prototype.init = function(useChannel,monitoringDefault = 1){
	this.monitoring = monitoringDefault;//OFF=0, ON=1. 指定なしは1
	this.whiteList = ['168036016333127680','168413030588088321','194842908312993793'];
	this.channel = useChannel;

}
LoginMonitoring.prototype.isMonitoring = function(){
	return this.monitoring;
};
LoginMonitoring.prototype.isMonitoringEvent = function(){
	return bot.listenerCount('presenceUpdate');
}
LoginMonitoring.prototype.changeMonitoring = function(id,mode){
	if(this.whiteList.indexOf(id) != -1){
		if(this.monitoring !== mode){
			this.monitoring = mode;

			if(mode===1){
				this.setEventListener(bot);
			}else{
				this.unsetEventListener(bot);
			}
			return ('change mode to '+this.monitoring);
		}
	}else{
		return ('権限がありません');
	}
};
LoginMonitoring.prototype.eventListener = function(oldMember,newMember) {
	//オフラインからオンラインになったときに発動
	if(oldMember.presence.status != newMember.presence.status){
		if(oldMember.presence.status === 'offline' && newMember.presence.status !== 'offline'){
			generalChannel.send(oldMember.user.username+'がオンラインになりました');//気持ち悪い
		}
	}
};
LoginMonitoring.prototype.setEventListener = function(botClient){
	botClient.on('presenceUpdate', this.eventListener);
};
LoginMonitoring.prototype.unsetEventListener = function(botClient){
	botClient.removeAllListeners('presenceUpdate');
};
//モニタリングclass ココマデ


//presence監視用
// bot.on('presenceUpdate', (oldMember,newMember) => {
// 	//オフラインからオンラインになったときに発動
// 	if(oldMember.presence.status != newMember.presence.status){
// 		if(oldMember.presence.status === 'offline' && newMember.presence.status === 'online'){
// 			generalChannel.sendMessage(oldMember.user.username+'がオンラインになりました');
// 		}
// 	}
// });

// log our bot in
bot.on("error", error => {
	console.log(error);
})
bot.login(discordToken);