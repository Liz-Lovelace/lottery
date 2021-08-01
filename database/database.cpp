#include <iostream>
#include <fstream>
#include <string>
#include <chrono>
#include <limits.h>
#include <unistd.h>
#include <assert.h>
#include "include/json.hpp"
using json = nlohmann::json;

std::string getexepath(){
  char result[ PATH_MAX ];
  ssize_t count = readlink( "/proc/self/exe", result, PATH_MAX );
  std::string fullpath = std::string( result, (count > 0) ? count : 0 );
  int i = fullpath.size()-1;
  while(fullpath[i] != '/'){
    fullpath.pop_back();
    i--;
  }
  assert(fullpath.size() > 0);
  return fullpath;
}

void strToFile(std::string str, std::string path){
  std::ofstream file;
  file.open(path);
  assert("file.open() failed" && file);
  file << str;
  file.close();
}

std::string fileToStr(std::string path){
  std::ifstream file(path);
  std::string str((std::istreambuf_iterator<char>(file)), (std::istreambuf_iterator<char>()));
  return str;
}

int timeNow(){
  return std::chrono::duration_cast<std::chrono::seconds>(std::chrono::system_clock::now().time_since_epoch()).count();
}

json roundInit(std::string prizeName, int ticketCost, int ticketGoal){
  assert(ticketGoal > 0);
  json j;
  j["info"]["prize_name"] = prizeName;
  j["info"]["ticket_cost"] = ticketCost;
  j["info"]["ticket_goal"] = ticketGoal;
  
  j["info"]["creation_time"] = timeNow();
  j["players"] = {};
  return j;
}

json roundAddTransaction(json j, int userId, int ticketsBought){
  //finds index of player in the array "players"
  int playerN = -1;
  for (unsigned int i = 0; i < j["players"].size(); i++)
    if (j["players"][i]["user_id"] == userId)
      playerN = i;
  
  // adds a new entry into array "players"
  if (playerN == -1){
    json player;
    player["total_tickets_bought"] = 0;
    player["user_id"] = userId;
    j["players"] += player;
    playerN = j["players"].size()-1;
  }
  
  json transaction;
  transaction["operation_time"] = timeNow();
  transaction["tickets_bought"] = ticketsBought;
  j["players"][playerN]["transactions"] += transaction;
  j["players"][playerN]["total_tickets_bought"] = (int)j["players"][playerN]["total_tickets_bought"] + ticketsBought;
  return j;
}

int main(int argc, char **argv){
  std::string contextFolderPath = getexepath();
  std::string currentRoundPath = contextFolderPath + "current-round.txt";
  assert("no command provided" && argc > 1);
  std::string command = argv[1];
  if (command == "cr_init"){
    assert("wrong argument count" && argc == 5);
    std::string content = roundInit(
      argv[2],            //prizeName
      std::stoi(argv[3]), //ticketCost
      std::stoi(argv[4])  //ticketGoal
      ).dump(2);
    strToFile(content, currentRoundPath);
  }
  else if (command == "cr_new_entry"){
    json crJson = json::parse(fileToStr(currentRoundPath));
    assert("wrong argument count" && argc == 4);
    crJson = roundAddTransaction(
      crJson,
      std::stoi(argv[2]), //userId
      std::stoi(argv[3])  //ticketsBought
    );
    strToFile(crJson.dump(2), currentRoundPath);
  } 
  else if (command == "cr_dump")
    std::cout << fileToStr(currentRoundPath);
  else if (command == "cr_clear")
    strToFile("", currentRoundPath);
  else 
    std::cerr << "command not recognized";
  return 0;
}