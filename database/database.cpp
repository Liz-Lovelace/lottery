#include <iostream>
#include <fstream>
#include <string>
#include <chrono>
#include <limits.h>
#include <unistd.h>
#include <nlohmann/json.hpp>

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
  return fullpath;
}

std::string currentRoundPath = getexepath() + "current-round.txt";

void currentRoundAddEntry(int userId, int money){
  auto time = std::chrono::duration_cast<std::chrono::seconds>(std::chrono::system_clock::now().time_since_epoch()).count();
  std::fstream currentRoundFile;
  currentRoundFile.open(currentRoundPath, std::ios::app);
  if (!currentRoundFile){
    std::cout << "error opening current round file for appending!";
    throw;
  }
  currentRoundFile << userId <<' '<< money <<' '<< time << '\n';
  currentRoundFile.close();
}

void currentRoundClear(){
  std::ofstream currentRoundFile;
  currentRoundFile.open(currentRoundPath, std::ofstream::out | std::ofstream::trunc);
  if (!currentRoundFile){
    std::cout << "error opening current round file for clearing!";
    throw;
  }
  currentRoundFile.close();
}

void currentRoundWriteStr(std::string str){
  std::ofstream currentRoundFile;
  currentRoundFile.open(currentRoundPath);
  if(!currentRoundFile){
    std::cout << "can't open current round file for writing!";
    throw;
  }
  currentRoundFile << str;
  currentRoundFile.close();
}

std::string getStrCurrentRound(){
  std::ifstream currentRoundFile;
  currentRoundFile.open(currentRoundPath);
  std::string line = "", str = "";
  while(std::getline(currentRoundFile, line)){
    str += line + '\n';
  }
  currentRoundFile.close();
  return str;
}

int main(int argc, char **argv){
  json sample;
  sample["hey"] = 10;
  currentRoundWriteStr(sample.dump());
  json fileJson = json::parse(getStrCurrentRound());
  std::cout << fileJson["hey"];
  if(argc > 1){
    if ((std::string)argv[1] == "add_payment"){
      currentRoundAddEntry(std::stoi(argv[2]), std::stoi(argv[3]));
    } else if ((std::string)argv[1] == "clear_current_round"){
      currentRoundClear();
    } else if ((std::string)argv[1] == "dump_current_round"){
      std::cout << getStrCurrentRound();
    } else 
      std::cout << "command not specified!";
  }
  return 0;
}