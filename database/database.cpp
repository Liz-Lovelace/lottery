#include <iostream>
#include <fstream>
#include <string>
#include <chrono>


struct Entry{
  std::string user = "";
  int money = 0;
  int time = 0;
  Entry(std::string u, int m, int t){user = u; money = m; time = t;}
};

void currentRoundAppend(Entry entry){
  std::fstream currentRoundFile;
  currentRoundFile.open("current-round.txt", std::ios::app);
  if (!currentRoundFile){
    std::cout << "error opening current round file for appending!";
    throw;
  }
  currentRoundFile << entry.user <<' '<< entry.money <<' '<< entry.time << '\n';
  currentRoundFile.close();
}

void currentRoundClear(){
  std::ofstream currentRoundFile;
  currentRoundFile.open("current-round.txt", std::ofstream::out | std::ofstream::trunc);
  if (!currentRoundFile){
    std::cout << "error opening current round file for clearing!";
    throw;
  }
  currentRoundFile.close();
}

std::string getRawCurrentRound(){
  std::ifstream currentRoundFile;
  currentRoundFile.open("current-round.txt");
  std::string line = "", str = "";
  while(std::getline(currentRoundFile, line)){
    str += line + '\n';
  }
  currentRoundFile.close();
  return str;
}

int main(int argc, char **argv){
  if ((std::string)argv[1] == "add_payment"){
    auto time = std::chrono::duration_cast<std::chrono::seconds>(std::chrono::system_clock::now().time_since_epoch()).count();
    currentRoundAppend(Entry(argv[2], std::stoi(argv[3]), time));
  } else if ((std::string)argv[1] == "clear_current_round"){
    currentRoundClear();
  } else if ((std::string)argv[1] == "dump_current_round"){
    std::cout << getRawCurrentRound();
  } else 
    std::cout << "command not specified!";
  return 0;
}