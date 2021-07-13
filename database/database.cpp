#include <iostream>
#include <fstream>
#include <string>
#include <chrono>
#include <limits.h>
#include <unistd.h>
#include <nlohmann/json.hpp>
#include <assert.h>
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
  assert(file);
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
  json j;
  assert(ticketGoal > 0);
  j["info"]["prize_name"] = prizeName;
  j["info"]["ticket_cost"] = ticketCost;
  j["info"]["ticket_goal"] = ticketGoal;
  
  j["info"]["creation_time"] = timeNow();
  j["entries"] = {};
  return j;
}

json roundAddEntry(json j, int userId, int ticketsBought){
  json entry;
  entry["user_id"] = userId;
  entry["tickets_bought"] = ticketsBought;
  entry["operation_time"] = timeNow();
  j["entries"] += entry;
  return j;
}

int main(int argc, char **argv){
  std::string contextFolderPath = getexepath();
  std::string currentRoundPath = contextFolderPath + "current-round.txt";
  if(argc > 1){
    std::string command = argv[1];
    if (command == "cr_init"){
      //TODO: this is ugly, need to refactor it somehow
      assert(argv[2] && argv[3] && argv[4]);
      std::string prizeName = argv[2];
      int ticketCost = std::stoi(argv[3]);
      int ticketGoal = std::stoi(argv[4]);
      std::string content = roundInit(
        prizeName,
        ticketCost,
        ticketGoal
        ).dump(2);
      strToFile(content, currentRoundPath);
    }
    else if (command == "cr_new_entry"){
      std::string crContents = fileToStr(currentRoundPath);
      json crJson = json::parse(crContents);
      assert(argv[2] && argv[3]);
      int userId = std::stoi(argv[2]);
      int ticketsBought = std::stoi(argv[3]);
      crJson = roundAddEntry(crJson, userId, ticketsBought);
      strToFile(crJson.dump(2), currentRoundPath);
    } 
    else if (command == "cr_dump"){
      std::cout << fileToStr(currentRoundPath);
    }
    else if (command == "cr_clear"){
      strToFile("", currentRoundPath);
    }
    else 
      std::cerr << "command not recognized";
  }
  return 0;
}