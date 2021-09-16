while (true) do
  rm log.json
  clear
  g++ logger.cpp -o logger
  #./logger userInterface-telegram-msg "initbruv" 123 999
  #./logger database-init              "ok bruv"  123 999
  ./logger userInterface-telegram-buy "buy"      290 888
  cat log.json
  read var
done