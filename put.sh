#!/bin/bash
for i in {1..50000}
do
   echo "Stream real-time $i event"
   curl --header "Content-Type: application/json" --request PUT --data '{"Id":'$i',"Nome":"Nome '$i'"}' http://localhost:5000/api/Cliente
   sleep 5 
done
