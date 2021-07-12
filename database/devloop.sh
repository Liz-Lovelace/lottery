while(true) do
  clear
  g++ database.cpp -o database
  ./database cr_clear
  ./database cr_new_entry 100 500
  echo 'current round file contents:'
  cat current-round.txt
  read var
done