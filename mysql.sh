 
 test -n "$1" &&  docker exec -it mysql-db3 rm  /tmp/mysql.log  || echo skip rm
 docker exec -it mysql-db3 cat /tmp/mysql.log > /tmp/mysql.log
 code /tmp/mysql.log 

