while(true) do
  rm users/*
  clear
  g++ database.cpp -o database
  ./database user_init 123
  ./database set_user_field 123 agreement True
  ./database set_user_field 123 hello world 
  ./database set_user_field 123 number 7
  ./database set_user_field 123 aaaa null
  
  ./database get_user_field 123 agreement 
  echo
  ./database get_user_field 123 hello
  echo
  ./database get_user_field 123 number
  echo
  ./database get_user_field 123 aaaa
  echo
  echo
  echo '  users folder contents:'
  ls users
  echo "  users 123's file contents:"
  cat users/123
  read var
done