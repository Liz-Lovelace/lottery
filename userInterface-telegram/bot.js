const {Telegraf} = require('telegraf');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require ('fs');
const emj = require('node-emoji');
global.__basedir = __dirname;

function syncFileToStr(fileName){
  let str = fs.readFileSync(fileName, {encoding:'utf8', flag:'r'});
  return str;
}

async function safeExec(cmd){
  try {
    let {stdout, stderr} = await exec(__basedir + '/' + cmd);
    if (stderr) {console.log(stderr); throw stderr;}
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


const bot = new Telegraf(syncFileToStr(__basedir + '/tokens/test-token.txt'));

let text = {
  // keyboard buttons
  btn: {
    instructions : 'Как это работает ' + emj.get('question'),
    roundInfo : 'Что сейчас разыгрывается ' + emj.get('game_die'),
    selfInfo : 'Сколько у меня билетов ' + emj.get('information_source'),
    purchaseTickets : 'Купить билеты ' + emj.get('admission_tickets'),
    other : 'Прочее... ' + emj.get('star'), 
  },
  long: {
    instructions: 'Здесь будут инструкции',
    other: 'Здесь будет ссылка на телеграм канал и возможно что-нибудь ещё',
  },
  //other
  howManyTickets: 'Сколько вы хотите купить?',
  operationSuccess: 'Операция успешна!',
  operationFailure: 'Что-то пошло не так, напишите админу!',
}

let forceReply = {reply_markup: {force_reply: true}};
let mainMenu = {
  reply_markup: {keyboard: [
      [{text:text.btn.instructions},{text:text.btn.roundInfo}],
      [{text:text.btn.purchaseTickets},{text:text.btn.other}],
  ]}
};
bot.start(ctx=>{
  ctx.reply(
    'menu instructions placeholder', mainMenu);
});

bot.on('message', async ctx=>{  
  switch(ctx.message.text){
    case text.btn.instructions:
      ctx.reply(text.long.instructions);
      return;
    case text.btn.roundInfo:
      sendRoundInfo(ctx);
      return;
    case text.btn.selfInfo:
      sendSelfInfo(ctx);
      return;
    case text.btn.purchaseTickets:
      ctx.reply(text.howManyTickets, forceReply);
      return;
    case text.btn.other:
      ctx.reply(text.long.other);
      return;
  }
  
  if(ctx.message.reply_to_message)
    switch(ctx.message.reply_to_message.text){
      case text.howManyTickets:
        let result = await buyTickets(ctx, ctx.message.text);
        if (result == 0)
          ctx.reply(text.operationSuccess, mainMenu);
        else
          ctx.reply(text.operationFailure, mainMenu);
        return;
    }
});

bot.command('info', ctx=>{sendRoundInfo(ctx); sendSelfInfo(ctx);});

async function buyTickets(ctx, amount){
  let code = 0;
  let result = await safeExec('../database/database cr_new_entry '+ ctx.message.from.id + ' ' +amount).catch(err=>{console.log(err); code = 1});
  return code;
};

bot.launch();