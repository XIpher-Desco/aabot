/*
  A ping pong bot, whenever you send "ping", it replies "pong".
*/
// 開発メモ！
//removeListener(event, listener)	イベントハンドラの削除

// import the discord.js module
const Discord = require('discord.js');

// create an instance of a Discord Client, and call it bot
const bot = new Discord.Client();

// the token of your bot - https://discordapp.com/developers/applications/me
var fs = require('fs');
fs.readFile('./discord_token', 'utf8', function (err, text) {
    console.log('text file!');
    console.log(text);
    console.log('error!?');
    console.log(err);
});
const token = '';

// the ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted.
var generalChannel;//ジェネラルのチャンネル
var testcanChannel;//ボットテスト用サーバーのテストチャンネル（他チャンネルテスト用）

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
	generalChannel.sendMessage('ボットがオンラインになりました');
	LMC.init(generalChannel,1);//ログイン監視クラスの初期化
	if(LMC.isMonitoring()!==0 && LMC.isMonitoringEvent()===0){
		LMC.setEventListener(bot);
		generalChannel.sendMessage('監視開始');
	}
});

// create an event listener for messages
bot.on('message', message => {
  // if the message is "ping",
  if (message.content === 'ping') {
    // send "pong" to the same channel.
    message.channel.sendMessage('pong');
  }
  if (message.content === 'マジやばくね？'){
  	message.channel.sendMessage('マジやばい！');
  }
  if (message.content === 'とまと'){
  	message.channel.sendMessage(':tomato:');
  }
  if (message.content === 'what is my id'){
  	message.channel.sendMessage( message.author.username +'\'s id is '+message.author.id);
  }
  if (message.content === 'monitoring on'){
  	message.channel.sendMessage(LMC.changeMonitoring(message.author.id,1));
  }
  if (message.content === 'monitoring off'){
  	message.channel.sendMessage(LMC.changeMonitoring(message.author.id,0));
  }
});

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
			generalChannel.sendMessage(oldMember.user.username+'がオンラインになりました');//気持ち悪い
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
bot.login(token);