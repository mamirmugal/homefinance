
mongoexport -d myporj -c bank -o ./bank.json_$(date +"%d-%m-%Y")

sleep 1

mongoexport -d myproj -c expenses -o ./expenses.json_$(date +"%d-%m-%Y");
