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

void strToFile(std::string str, std::string path){
  std::ofstream file;
  file.open(path);
  if(!file){
    std::cout << "can't open file" + path + " for writing!";
    throw;
  }
  file << str;
  file.close();
}

std::string fileToStr(std::string path){
  std::ifstream file(path);
  std::string str((std::istreambuf_iterator<char>(file)), (std::istreambuf_iterator<char>()));
  return str;
}

void roundInit(std::string path){
  strToFile("owo hewwo owo", path);
}

std::string roundAddEntry(std::string str, int userId, int paymentAmount){
  auto time = std::chrono::duration_cast<std::chrono::seconds>(std::chrono::system_clock::now().time_since_epoch()).count();
  std::fstream RoundFile;
  str += "\n" + std::to_string(userId) + " " + std::to_string(paymentAmount) + " " + std::to_string(time);
  //implement!
  return str;
}

int main(int argc, char **argv){
  std::string contextFolderPath = getexepath();
  std::string currentRoundPath = contextFolderPath + "current-round.txt";
  if(argc > 1){
    std::string command = argv[1];
    if (command == "cr_init"){
      roundInit(currentRoundPath);
    }
    else if (command == "cr_new_entry"){
      std::string crContents = fileToStr(currentRoundPath);
      int userId = std::stoi(argv[2]);
      int paymentAmount = std::stoi(argv[3]);
      crContents = roundAddEntry(crContents, userId, paymentAmount);
      strToFile(crContents, currentRoundPath);
    } 
    else if (command == "cr_dump"){
      std::cout << fileToStr(currentRoundPath);
    }
    else if (command == "cr_clear"){
      strToFile("", currentRoundPath);
    }
    else 
      std::cout << "command not recognized";
  }
  return 0;
}