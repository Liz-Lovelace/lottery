const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

function syncFileToStr(fileName){
  return fs.readFileSync(fileName, {encoding:'utf8', flag:'r'});
}

async function callDatabase(cmd){
  console.log('database ' + cmd);
  let {stdout, stderr} = await exec(__dirname + '/../../database/database ' + cmd);
  console.log('  >' + stdout);
  return stdout;
}

async function getUserField(id, fieldName){
  let str =  await callDatabase('get_user_field ' + id + ' ' + fieldName);
  if (str.toLowerCase() == 'null')
    return null;
  else if (str.toLowerCase() == 'true')
    return true;
  else if (str.toLowerCase() == 'false')
    return false;
  return str;
}

async function setUserField(id, fieldName, value){
  await callDatabase('set_user_field ' + id + ' ' + fieldName + ' ' + value);
}

function countTotalBoughtTickets(j){
  if(!j.players)
    return 0;
  sum = 0;
  for(let i = 0; i < j.players.length; i++)
    sum += j.players[i].total_tickets_bought;
  return sum;
}

function userTotalBoughtTickets(j, id){
  if (!j.players)
    return 0;
  sum = 0;
  for(let i = 0; i <j.players.length; i++)
    if (j.players[i].user_id == id)
      return j.players[i].total_tickets_bought;
  throw "couldn't find user to count tickets!";
}

module.exports = {syncFileToStr, callDatabase, getUserField, setUserField, countTotalBoughtTickets, userTotalBoughtTickets};