//Running scheduled tasks
let database =  require("../database/database");
let dateMod =  require("../database/date");

(async function(){
  await database.mainInterface("connectClient");
})();


var cron = require('node-cron');
var cron_checker = require('node-cron');


cron.schedule('0 1 * * *', async() => {//Sheduling the loading of new spreadsheet every day at 12Am
            try{
              console.log("IN");
              // await database.mainInterface("connectClient");
              await database.mainInterface("loadNewSpreadsheet");
              // await database.mainInterface("closeClient");
            }catch(error){
                console.log(error);
            }
            console.log('Running a task: adding new spreadsheet');
}, {
  scheduled: true,
  timezone: 'America/Sao_Paulo'
});

cron_checker.schedule('0 */2 * * *', async () => {//Checks periodally whether a new sheet has been uploaded for a new day
  try{
    // await database.mainInterface("connectClient");
    const spreadsheetInfo=await database.mainInterface("getSavingMode");

    console.log(spreadsheetInfo);
    const dateObj=await dateMod.updateDate();

    //console.log("spreadsheetInfo.day: "+spreadsheetInfo.day+" dateObj.day: "+dateObj.monthDay);

    if(spreadsheetInfo==null||spreadsheetInfo==undefined||spreadsheetInfo.day!=dateObj.monthDay){
            await database.mainInterface("loadNewSpreadsheet");
    }
    // await database.mainInterface("closeClient");

  }catch(error){
      console.log(error);
  }

  console.log('Running a task: new day spreadsheet check');
});

module.export={cron,cron_checker};
