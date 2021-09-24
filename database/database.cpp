#include <iostream>
#include <fstream>
#include <string>
#include <assert.h>
#include "include/json.hpp"
#include "include/utils.hpp"
#include "include/setget.hpp"

using json = nlohmann::json;

json dumpUserInfo(int id){
  return json::parse(fileToStr(getexepath() + "/users/" + std::to_string(id)));
}

int main(int argc, char **argv){
  std::string contextFolderPath = getexepath();
  std::string currentRoundPath = contextFolderPath + "current-round.txt";
  std::string usersFolderPath = contextFolderPath + "users/";
  assert("no command provided" && argc > 1);
  std::string command = argv[1];
  
  //current round
  if (command == "cr_init"){
    assert("usage: cr_init prizeName ticketCost ticketGoal" && argc == 5);
    json contentj = roundInit(
      argv[2],            //prizeName
      std::stoi(argv[3]), //ticketCost
      std::stoi(argv[4])  //ticketGoal
    );
    strToFile(contentj.dump(2), currentRoundPath);
  }
  
  else if (command == "cr_new_entry"){
    assert("USAGE: cr_new_entry 123 1" && argc == 4);
    json crJson = json::parse(fileToStr(currentRoundPath));
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
  
  // user
  else if (command == "user_init"){
    assert("USAGE: user_init 1234567" && argc == 3);
    strToFile("{\"initialized\":true}", usersFolderPath + argv[2]);
  }
  
  else if (command == "get_user_field"){
    assert("USAGE: get_user_field 123 field_name" && argc == 4);
    std::string userFilePath = usersFolderPath + argv[2];
    std::string contents = fileToStr(userFilePath);
    if (contents == "NULL"){
      std::cout << "NULL";
      return 0;
    }
    json userj = json::parse(contents);
    std::cout << userj[argv[3]];
  }
  
  else if (command == "set_user_field"){
    assert("usage: set_user_field 123 field_name value" && argc == 5);
    std::string userFilePath = usersFolderPath + argv[2];
    std::string contents = fileToStr(userFilePath);
    if (contents == "NULL"){
      std::cout << "NULL";
      return 0;
    }
    json userj = json::parse(contents);
    userj = setUserField(userj, argv[3], argv[4]);
    std::cout << argv[4] << " in " << userj.dump(2);
    strToFile(userj.dump(2), userFilePath);
  }
  
  //other
  else 
    std::cerr << "command " + command + " not recognized!\n";
  
  return 0;
}