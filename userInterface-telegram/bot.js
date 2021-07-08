const {Telegraf} = require('telegraf');
const fs = require ('fs');

function syncFileToStr(fileName){
  let token = fs.readFileSync(fileName, {encoding:'utf8', flag:'r'});
  return token;
}

const bot = new Telegraf(syncFileToStr('./tokens/test-token.txt'));

bot.start(ctx=>{
  ctx.reply('Oh hello there!');
})

bot.command('bet', ctx=>{
  ctx.reply('you bet!');
})

bot.launch();