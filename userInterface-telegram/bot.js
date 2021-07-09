const {Telegraf} = require('telegraf');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require ('fs');

function syncFileToStr(fileName){
  let token = fs.readFileSync(fileName, {encoding:'utf8', flag:'r'});
  return token;
}

const bot = new Telegraf(syncFileToStr('./tokens/test-token.txt'));

bot.start(ctx=>{
  ctx.reply('Oh hello there!');
})

bot.command('see', async ctx=>{
  let message;
  try {
    let {stdout, stderr} = await exec('../database/database dump_current_round');
    message = stdout;
  } catch(err){
    console.log(err);
    return;
  };
  if(message == '')
    message = "There are currently no bets"
  ctx.reply(message);
})

bot.launch();