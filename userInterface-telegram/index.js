const {Telegraf} = require('telegraf');
const fs = require ('fs');
const emj = require('node-emoji');
const {syncFileToStr, callDatabase, getUserField, setUserField, countTotalBoughtTickets, userTotalBoughtTickets} = require('./include/utils.js');

async function sendRoundInfo(ctx){
  let dump = await callDatabase('cr_dump').catch(err=>ctx.reply(err));
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
  let result = await callDatabase('cr_new_entry '+ ctx.message.from.id + ' ' +amount).catch(err=>{console.log(err); code = 1});
  return code;
}

async function sendSelfInfo(ctx){
  let dump = await callDatabase('cr_dump').catch(err=>ctx.reply(err));
  let round = JSON.parse(dump);
  if(!round)
    ctx.reply('empty.');
  userTicketCount = userTotalBoughtTickets(round, ctx.from.id);
  ctx.reply(
    'У вас ' + userTicketCount + emj.get('gem')+'\n' +
    'Шанс выйграть: ' + userTicketCount/round.info.ticket_goal*100 + '%'
  )
}

let text = JSON.parse(fs.readFileSync(__dirname + '/data/text.json'));

let markups = {
  forceReply: {
    reply_markup: {force_reply: true}
  },
  main: {
    reply_markup: {keyboard: [
        [{text:text.btn.instructions},{text:text.btn.roundInfo},{text:text.btn.other}],
        [{text:text.btn.purchaseTickets},{text:text.btn.selfInfo}],
    ]}
  },
  yesNo: {
    reply_markup: {keyboard: [
      [text.btn.yes, text.btn.no]
    ]}
  }
}

const bot = new Telegraf(syncFileToStr(__dirname + '/data/token.txt'));

bot.on('message', async ctx=>{
  let id = ctx.from.id;
  let msgText = ctx.message.text;
  
  if (!await getUserField(id, 'initialized'))
    await callDatabase('user_init ' + id);
  
  
  //doesn't let user do anything else until they agreed to the user agreement  
  if (!await getUserField(id, 'user_agreement')){
    if (msgText == text.btn.yes){
      await setUserField(id, 'user_agreement', true);
      await ctx.reply('good', markups.main)
      return;
    } else {
      await ctx.reply('to get to do stuff, please use the buttons on the bottom to agree to the user agreement', markups.yesNo);
      await ctx.reply(text.long.userAgreement);
      return;
    }
  }
  
  /*
  if(ctx.message.reply_to_message)
    switch(ctx.message.reply_to_message.text){
      case text.howManyTickets:
        let result = await buyTickets(ctx, ctx.message.text);
        if (result == 0)
          ctx.reply(text.operationSuccess, markups.main);
        else
          ctx.reply(text.operationFailure, markups.main);
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
      ctx.reply(text.howManyTickets, markups.forceReply);
      return;
    case text.btn.other:
      ctx.reply(text.long.other);
      return;
  }
  */
});

bot.launch();