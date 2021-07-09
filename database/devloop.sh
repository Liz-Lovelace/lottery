while(true) do
  clear
  g++ database.cpp -o database
  echo 'from dir'
  ./database dump_current_round
  cd ..
  echo 'from parent'
  ./database/database dump_current_round
  cd database
  echo 'current round file contents:'
  cat current-round.txt
  read var
done