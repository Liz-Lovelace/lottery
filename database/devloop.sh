while(true) do
  clear
  g++ database.cpp -o database
  ./database cr_clear
  ./database cr_init recur 1 1000
  ./database cr_new_entry 9023 150
  ./database cr_new_entry 493 300
  ./database cr_new_entry 9023 100
  ./database cr_new_entry 493 50
  ./database cr_new_entry 493 50
  echo 'current round file contents:'
  cat current-round.txt
  read var
done