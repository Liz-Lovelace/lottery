#pragma once
#include <string>
#include <assert.h>
#include "json.hpp"
#include "utils.hpp"

using json = nlohmann::json;

  /*=================USER INFO=================*/

json setUserField(json j, std::string field, std::string value){
  transform(value.begin(), value.end(), value.begin(), ::tolower);
  if(value == "true")
    j[field] = true;
  else if(value == "false")
    j[field] = false;
  else if(value == "null")
    j[field] = nullptr;
  else try{
    j[field] = std::stoi(value);
  }catch(std::invalid_argument& err){
    j[field] = value;
  }
  return j;
}

  /*=================ROUND INFO=================*/

json roundInit(std::string prizeName, int ticketCost, int ticketGoal){
  assert(ticketGoal > 0 && ticketCost > 0);
  json j;
  j["info"]["prize_name"]  = prizeName;
  j["info"]["ticket_cost"] = ticketCost;
  j["info"]["ticket_goal"] = ticketGoal;
  j["info"]["creation_time"] = timeNow();
  j["players"] = {};
  return j;
}

json roundAddTransaction(json j, int userId, int ticketsBought){
  //finds index of player in the array "players" by id
  int playerN = -1;
  for (unsigned int i = 0; i < j["players"].size(); i++)
    if (j["players"][i]["user_id"] == userId){
      playerN = i;
      break;
    }
  
  // adds a new entry into array "players" if it doesn't exist yet
  if (playerN == -1){
    json player;
    player["total_tickets_bought"] = 0;
    player["user_id"] = userId;
    j["players"] += player;
    playerN = j["players"].size()-1;
  }
  
  //updates an existing entry in array "players"
  json transaction;
  transaction["operation_time"] = timeNow();
  transaction["tickets_bought"] = ticketsBought;
  j["players"][playerN]["transactions"] += transaction;
  j["players"][playerN]["total_tickets_bought"] = (int)j["players"][playerN]["total_tickets_bought"] + ticketsBought;
  
  return j;
}
