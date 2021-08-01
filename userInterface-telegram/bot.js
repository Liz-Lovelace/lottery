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
  if(!j.players)
    return 0;
  sum = 0;
  for(let i = 0; i < j.players.length; i++){
    sum += j.players[i].total_tickets_bought;
  }
  return sum;
}

function userTotalBoughtTickets(j, id){
  sum = 0;
  if (!j.players)
    return 0;
  for(let i = 0; i <j.players.length; i++)
    if (j.players[i].user_id == id)
      return j.players[i].total_tickets_bought;
  throw "couldn't find user to count tickets!";
}

async function sendRoundInfo(ctx){
  let dump = await safeExec('../database/database cr_dump').catch(err=>ctx.reply(err));
  let round = JSON.parse(dump);
  if(!round)
    ctx.reply('empty.');
  ctx.reply(
    'Сейчас разыгрывается: ' + round.info.prize_name + '\n' +
    'Алмазиков продано: ' + countTotalBoughtTickets(round) + '/' + round.info.ticket_goal  +'\n\n' +
    'Один алмазик стоит ' + round.info.ticket_cost + '₽');
}

async function buyTickets(ctx, amount){
  let code = 0;
  let result = await safeExec('../database/database cr_new_entry '+ ctx.message.from.id + ' ' +amount).catch(err=>{console.log(err); code = 1});
  return code;
}

async function sendSelfInfo(ctx){
  let dump = await safeExec('../database/database cr_dump').catch(err=>ctx.reply(err));
  let round = JSON.parse(dump);
  if(!round)
    ctx.reply('empty.');
  userTicketCount = userTotalBoughtTickets(round, ctx.from.id);
  ctx.reply(
    'У вас ' + userTicketCount + emj.get('gem')+'\n' +
    'Шанс выйграть: ' + userTicketCount/round.info.ticket_goal*100 + '%'
  )
}


const bot = new Telegraf(syncFileToStr(__basedir + '/tokens/test-token.txt'));



let text = {
  // keyboard buttons
  btn: {
    instructions : 'Как это работает ' + emj.get('question'),
    roundInfo : 'Что сейчас разыгрывается ' + emj.get('game_die'),
    selfInfo : 'Сколько у меня алмазиков ' + emj.get('information_source'),
    purchaseTickets : 'Купить алмазики ' + emj.get('gem'),
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
      [{text:text.btn.instructions},{text:text.btn.roundInfo},{text:text.btn.other}],
      [{text:text.btn.purchaseTickets},{text:text.btn.selfInfo}],
  ]}
};
bot.start(ctx=>{
  ctx.reply(
    text.long.instructions, mainMenu);
});


bot.on('message', async ctx=>{  
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
  
});

bot.launch();