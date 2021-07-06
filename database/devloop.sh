while(true) do
  clear
  g++ database.cpp -o database
  ./database add_payment me 100
  echo 'current round file contents:'
  cat current-round.txt
  read var
done