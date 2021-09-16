#pragma once
#include <iostream>
#include <string>
#include <chrono>
#include <limits.h>
#include <unistd.h>
#include <assert.h>
#include <fstream>

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
  if (!file.is_open())
    return "NULL";
  std::string str((std::istreambuf_iterator<char>(file)), (std::istreambuf_iterator<char>()));
  return str;
}
