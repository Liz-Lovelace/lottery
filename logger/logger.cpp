#include <iostream>
#include <fstream>
#include <limits.h>
#include <unistd.h>
#include <assert.h>
#include <string>
#include "./include/json.hpp"
#include <chrono>
using json = nlohmann::json;

int timeNow(){
  return std::chrono::duration_cast<std::chrono::seconds>(std::chrono::system_clock::now().time_since_epoch()).count();
}

std::string getexepath(){
  char result[ PATH_MAX ];
  ssize_t count = readlink( "/proc/self/exe", result, PATH_MAX );
  std::string fullpath = std::string( result, (count > 0) ? count : 0 );
  int i = fullpath.size()-1;
  while(fullpath[i] != '/'){
    fullpath.pop_back();
    i--;
  }
  fullpath.pop_back();
  assert(fullpath.size() > 0);
  return fullpath;
}

int main(int argn, char* argv[]){
  //0      1      2       3      4
  //logger source message userId roundId
  std::string procPath = getexepath();
  std::ofstream logFile;
  
  json newEntry;
  newEntry["source"] = argv[1];
  newEntry["time"] = timeNow();
  newEntry["message"] = argv[2];
  newEntry["user_id"] = std::stoi(argv[3]);
  newEntry["round_id"] = std::stoi(argv[4]);
  
  std::string newEntryStr = newEntry.dump(2);
  
  logFile.open(procPath + "/log.json", std::ios::app);
  logFile << newEntryStr << ",\n";
  logFile.close();
}