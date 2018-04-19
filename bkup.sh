
#mongoexport -d myporj -c bank -o ./bank.json
mongoexport -d myproj -c bank -o bank_$(date +"%d-%m-%Y").json

sleep 1

mongoexport -d myproj -c expenses -o ./expenses_$(date +"%d-%m-%Y").json
