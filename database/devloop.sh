while(true) do
  clear
  g++ database.cpp -o database
  ./database
  echo 'current round file contents:'
  cat current-round.txt
  read var
done