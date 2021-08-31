while(true) do
  rm users/*
  clear
  g++ database.cpp -o database
  ./database user_init 123
  ./database set_user_field agreement True 123
  ./database set_user_field hello world 123
  ./database set_user_field number 7 123
  ./database set_user_field aaaa "null" 123
  
  ./database get_user_field agreement 123
  ./database get_user_field hello 123
  ./database get_user_field number 123
  ./database get_user_field aaaa 123
  echo 'users folder contents:'
  ls users
  echo "users 123's file contents:"
  cat users/123
  read var
done