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

int main(int argc, char **argv){
  if (argv[1] == "add_payment"){
    //this yelds wrong time
    unsigned long time = std::chrono::system_clock::now().time_since_epoch();// / std::chrono::milliseconds(1);
    currentRoundAppend(Entry(argv[2], std::stoi(argv[3]), time));
  }
  return 0;
}