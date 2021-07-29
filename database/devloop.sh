while(true) do
  clear
  g++ database.cpp -o database
  ./database cr_init dog 50 20
  ./database cr_new_entry 1 100
  ./database cr_new_entry 2 100
  ./database cr_new_entry 3 150
  echo 'current round file contents:'
  cat current-round.txt
  read var
done