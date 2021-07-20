const {Telegraf} = require('telegraf');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require ('fs');
global.__basedir = __dirname;

function syncFileToStr(fileName){
  let str = fs.readFileSync(fileName, {encoding:'utf8', flag:'r'});
  return str;
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

function countTotalBoughtTickets(j){
  sum = 0;
  if(!j.entries)
    return 0;
  for(let i = 0; i <j.entries.length; i++){
    sum += j.entries[i].tickets_bought;
  }
  return sum;
}

function countUserBoughtTickets(j, id){
  sum = 0;
  if (!j.entries)
    return 0;
  for(let i = 0; i <j.entries.length; i++){
    if (j.entries[i].user_id == id)
      sum += j.entries[i].tickets_bought;
  }
  return sum;
}

const bot = new Telegraf(syncFileToStr(__basedir + '/tokens/test-token.txt'));

bot.start(ctx=>{
  ctx.reply('Чтобы посмотреть информацию, введите /info\n' + 
    'Чтобы купить билеты, введите /buy X, где Х это число билетов', {
      reply_markup: {
        keyboard: [
          [
            {text:"credits"},
            {text:"api"}
          ]
        ]
      }
    });
});

async function sendRoundInfo(ctx){
  let dump = await safeExec('../database/database cr_dump').catch(err=>ctx.reply(err));
  let round = JSON.parse(dump);
  if(!round)
    ctx.reply('empty.');
  ctx.reply(
    'Сейчас разыгрывается: ' + round.info.prize_name + '\n' +
    'Билетов продано: ' + countTotalBoughtTickets(round) + '/' + round.info.ticket_goal  +'\n\n' +
    'Один билет стоит ' + round.info.ticket_cost + '₽');
}

async function sendSelfInfo(ctx){
  let dump = await safeExec('../database/database cr_dump').catch(err=>ctx.reply(err));
  let round = JSON.parse(dump);
  if(!round)
    ctx.reply('empty.');
  userTicketCount = countUserBoughtTickets(round, ctx.from.id);
  ctx.reply(
    'У вас ' + userTicketCount + ' билетов\n' +
    'Шанс выйграть: ' + userTicketCount/round.info.ticket_goal*100 + '%'
  )
}

bot.command('info', ctx=>{sendRoundInfo(ctx); sendSelfInfo(ctx);});

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
  await new Promise(resolve => setTimeout(resolve, 100));
  sendSelfInfo(ctx);
});

bot.launch();