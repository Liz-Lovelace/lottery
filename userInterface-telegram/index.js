const {Telegraf} = require('telegraf');
const fs = require ('fs');
const emj = require('node-emoji');
const {syncFileToStr, callDatabase, getUserField, setUserField, countTotalBoughtTickets, userTotalBoughtTickets} = require('./include/utils.js');

async function currentRoundInfoMsg(){
  let dump = await callDatabase('cr_dump').catch(err=>ctx.reply(err));
  let round = JSON.parse(dump);
  if(!round)
    return 'Empty.';
  return 'Сейчас разыгрывается: ' + round.info.prize_name + '\n' +
         'Алмазиков продано: ' + countTotalBoughtTickets(round) + '/' + round.info.ticket_goal  +'\n\n' +
         'Один алмазик стоит ' + round.info.ticket_cost + '₽';
}

async function selfCurrentRoundInfoMsg(id){
  let dump = await callDatabase('cr_dump').catch(err=>ctx.reply(err));
  let round = JSON.parse(dump);
  if(!round)
    return 'empty round';
  let userTicketCount = userTotalBoughtTickets(round, id);
  return 'У вас ' + userTicketCount + emj.get('gem')+'\n' +
         'Шанс выйграть: ' + userTicketCount/round.info.ticket_goal*100 + '%';
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
  //these are shortcuts
  let id = ctx.from.id;
  let msgText = ctx.message.text;
  let state = await getUserField(id, 'state');

  console.log('MESSAGE - ' + msgText + ' ('+state+')');
  
  if (!await getUserField(id, 'initialized'))
    await callDatabase('user_init ' + id);
  
  //doesn't let user do anything else until they agreed to the user agreement  
  if (!await getUserField(id, 'user_agreement')){
    if (msgText == text.btn.yes){
      await setUserField(id, 'user_agreement', true);
      await ctx.reply('good', markups.main)
      return;
    } else {
      await ctx.reply(text.long.userAgreementInstructions, markups.yesNo);
      await ctx.reply(text.long.userAgreement);
      return;
    }
  }
 
  switch(state){
    case 'awaitingHowManyTickets':
      console.log('number hehe');
      await callDatabase('cr_new_entry '+ id + ' ' + msgText)
      .catch(err=>{
        console.log(err);
        ctx.reply(text.operationFailure, markups.main);
        return;
      });
      setUserField(id, 'state', 'mainMenu')
      ctx.reply(text.operationSuccess, markups.main);
      return;
  }

  //these are all the main menu actions.
  switch(msgText){
    case text.btn.purchaseTickets:
      await setUserField(id, 'state', 'awaitingHowManyTickets');
      await ctx.reply(text.howManyTickets);
      return;
    case text.btn.roundInfo:
      ctx.reply(await currentRoundInfoMsg());
      return;
    case text.btn.selfInfo:
      ctx.reply(await selfCurrentRoundInfoMsg(id));
      return;
    case text.btn.other:
      ctx.reply(text.long.other);
      return;
    case text.btn.instructions:
      ctx.reply(text.long.instructions);
      return;
  }
});

bot.launch();