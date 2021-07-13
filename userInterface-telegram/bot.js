const {Telegraf} = require('telegraf');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require ('fs');
const emoji = require('node-emoji');
global.__basedir = __dirname;
let sampledump = '{\n  "entries": [\n    {\n      "operation_time": 1626213910,\n      "tickets_bought": 2,\n      "user_id": 1\n    },\n    {\n      "operation_time": 1626213914,\n      "tickets_bought": 3,\n      "user_id": 2\n    },\n    {\n      "operation_time": 1626213924,\n      "tickets_bought": 3,\n      "user_id": 3\n    }\n  ],\n  "info": {\n    "creation_time": 1626213705,\n    "prize_name": "АйФон10S",\n    "ticket_cost": 1000,\n    "ticket_goal": 10\n  }\n}';
function syncFileToStr(fileName){
  let token = fs.readFileSync(fileName, {encoding:'utf8', flag:'r'});
  return token;
}

async function safeExec(cmd, ctx = null){
  try {
    let {stdout, stderr} = await exec(__basedir + '/' + cmd);
    if (stderr) throw stderr;
    return stdout;
  } catch(err){
    console.log(err); 
    throw err;
  };
}

function countBoughtTickets(j){
  sum = 0;
  for(let i = 0; i <j.entries.length; i++){
    sum += j.entries[i].tickets_bought;
  }
  return sum;
}


const bot = new Telegraf(syncFileToStr(__basedir + '/tokens/test-token.txt'));

bot.start(ctx=>{
  ctx.reply('Oh hello there!');
});

async function sendRoundInfo(ctx){
  let dump = await safeExec('../database/database cr_dump').catch(err=>ctx.reply(err));
  let round = JSON.parse(dump);
  if(!round)
    ctx.reply('empty.');
  ctx.reply(
    'Сейчас разыгрывается: ' + round.info.prize_name + '\n' +
    'Билетов куплено: ' + countBoughtTickets(round) + '/' + round.info.ticket_goal  +'\n\n' +
    'Один билет стоит ' + round.info.ticket_cost + '₽');
}

bot.command('info', sendRoundInfo);

bot.command('buy', async ctx=>{
  let commands = ctx.message.text.split(' ');
  if (commands.length < 2 || isNaN(commands[1])){
    ctx.reply('Чтобы купить билеты, напишите \n' +
    '/buy [число билетов] \n' +
    'пример: /buy 3');
    return;
  }
  let ticketAmount = commands[1];
  if (isNaN(ticketAmount) || ticketAmount < 1) return;
  await safeExec('../database/database cr_new_entry '+ ctx.message.from.id + ' ' +ticketAmount).catch(err=>ctx.reply(err));
  //TODO: fix this garbage -----------------------v
  ctx.reply('Вы купили ' + ticketAmount + ' билет(ов)');
  await new Promise(resolve => setTimeout(resolve, 100));
  sendRoundInfo(ctx);
});

bot.launch();