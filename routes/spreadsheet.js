
const routes=require('express').Router();

const database =  require("../database/spreadsheet");


// (async function(){
//
//   await database.mainInterface("connectClient");
//
// })();



routes.get('/previewSpreadsheet', async function(req, res) {//Collect the data currently in the sheet
  let output=null;
  //pass in collection_name
  try{
    output=await database.mainInterface(req.session.user,"previewSpreadsheet");
  }
  catch(err){console.log(err)}
  finally{
    res.send(output);
  }
});


routes.get('/getLastUpdated', async function(req, res) {//Collect the data currently in the sheet
  let output=null;

  try{
    output=await database.mainInterface(req.session.user,"getLastUpdated");
  }
  catch(err){console.log(err);}
  finally{
    console.log("getLastUpdated: "+output);
    res.send(output);
   }
});


routes.get('/saveSpreadsheet', async function(req, res) {//Collect the data currently in the sheet
  let output=[false,null];
  console.log(" get mode: "+req.params.mode);
  try{
    output=[ true,await database.mainInterface(req.session.user,"saveSpreadsheet") ];

  }
  catch(err){console.log(err);}
  finally{
    console.log(output);
    res.send(output);
  }
});


routes.get('/getSavingMode', async function(req, res) {//Collect the data currently in the sheet
  let output=false;

  try{
    output=[true, await database.mainInterface(req.session.user,"getSavingMode") ];
  }
  catch(err){console.log(err);}
  finally{
    console.log("getSavingMode: "+JSON.stringify(output[1]));
    res.send(output);
   }
});


routes.get('/setSpreadsheetOld',async function(req,res){//Set spreadsheet to old
  let output=false;

  try{
    await database.mainInterface(req.session.user,"setSpreadsheetOld");
    output=true;
  }
  catch(err){console.log(err);}
  finally{
    res.send(output);
   }
});


routes.get('/getGraphDetails/:filter', async function(req,res){//Get data for graphs
  let output=null;

  try{

    output=await database.mainInterface(req.session.user,"getGraphDetails",{filter:req.params.filter,mode:'home',data:null});
  }
  catch(err){console.log(err);}
  finally{
    res.send(output);
   }
});


routes.get('/searchDatabase/:mode/:queryStr', async function(req,res){//Get data for graphs
  let output=null;

  try{
    output=[];
    output=await database.mainInterface(req.session.user,"searchDatabase",{mode:req.params.mode, queryStr:decodeURIComponent(req.params.queryStr)});

  }catch(err){console.log(err);}
  finally{
    res.send(output);
   }
});


routes.post('/getMemberGraph', async function (req, res){
      memberGraph=null;
      try{
        console.log("req.body.member: "+JSON.stringify(req.body.member)+ "req.body.filter: "+req.body.filter);
        var memberGraph=await database.mainInterface(req.session.user,"getGraphDetails",{filter:req.body.filter,mode:'search',data:req.body.member});

      }catch(err){console.log(err);}
      finally{
        res.send(memberGraph);
      }

});


module.exports=routes;
