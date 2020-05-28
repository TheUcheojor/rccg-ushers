/*

  This module contains the functions that interacts with the spreadsheet database.
  By requiring the module, one can interact with the spreadsheet database using the "mainInterface" control function

*/

/*
SECTION : Main
*/
require('dotenv').config();

//The following labled IMPORTANT are neccessary values for database operations

const uri =process.env.DATABASE_URI;//IMPORTANT: UrI Connection to mongodb database
let spreadsheetkey=process.env.SPREADSHEET_KEY;//IMPORTANT: Spreadsheet key( the is the long id in the sheets URL)

let database=process.env.DATABASE_NAME;//IMPORTANT: Dataebase and collection
let mainCollection=process.env.SPREADSHEET_COLLECTION_NAME;//IMPORTANT:Collection

let clientPath=process.env.CLIENT_SECRET_PATH;//IMPORTANT:Authorization

//Get access to  mongodb database
const MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
let client;
var collection;



//For Google Spreadsheet - node google spreadsheet (A google api framework for google-spreadsheets)
const { GoogleSpreadsheet } = require('google-spreadsheet');
let doc = new GoogleSpreadsheet(spreadsheetkey);//Access doc object


//Setting up date properties
var dateModule=require("./date");
var monthNumericalToString=dateModule.monthNumericalToString;
var allMonths=dateModule.allMonths;
var monthToNumOfDay=dateModule.monthToNumOfDay;
var stringToMonthNumerical=dateModule.stringToMonthNumerical;

var year, month,monthDay,time24Hrs;
setDate();







module.exports={mainInterface:mainInterface};

/*
    Strictly for testing purposes

    // (async function test(){
    //   await mainInterface("connectClient");
    //   // await mainInterface("saveSpreadsheet", {mode:"new"});
    //   //  await mainInterface("saveSpreadsheet", {mode:"old"});
    //   //await mainInterface("getGraphDetails");
    //   await searchDatabase('yearMonthDay','2020/may/12');
    //
    //   await mainInterface("closeClient");
    // })();


*/


async function mainInterface(desiredFunction, paramsObj){

    try{
      //setUp(sskey);

        var output="completed";

        if(desiredFunction=='connectClient'){
              client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology: true });
              await client.connect();
              collection= await client.db(database).collection(mainCollection);

              // load spreadsheet directly from json file
              await doc.useServiceAccountAuth(require(clientPath));
              await doc.loadInfo();// loads document properties and worksheets

        }if(desiredFunction=='closeClient'){
              await client.close();
        }else if(desiredFunction=='previewSpreadsheet'){
            return await previewSpreadsheet();

        }else if(desiredFunction=='saveSpreadsheet'){
                //console.log("desiredFunction mode: "+paramsObj.mode );
                return await saveSpreadsheet();

        }else if(desiredFunction=='searchDatabase'){
                var searchModes=["name", "year", "yearMonth", "yearMonthDay"];
                // var givenMode= searchModes.find( function(searchMode){return searchMode==paramsObj.mode} );
                // if(givenMode==null ||givenMode==undefined ||givenMode==""){return null;}
                console.log("paramsObj.mode,paramsObj.queryStr: "+paramsObj.mode+" "+paramsObj.queryStr);
                return  await searchDatabase(paramsObj.mode,paramsObj.queryStr) ;

        }else if (desiredFunction=='loadOldSpreadsheet'){
                return await loadOldSpreadsheet(paramsObj.givenYear,paramsObj.givenMonth,paramsObj.givenDay);

        }else if(desiredFunction=='loadNewSpreadsheet'){
                return await loadNewSpreadsheet();
        }else if(desiredFunction=="getLastUpdated"){
                return await getLastUpdated();
        }else if(desiredFunction=="getGraphDetails"){
                return await getGraphDetails(paramsObj.filter,paramsObj.mode,paramsObj.data);
        }else if(desiredFunction=="getSavingMode"){//Gets the Spreadsheet info
                return  (await collection.find( {Spreadsheet:{$exists:true,$ne:null}   }).toArray())[0] ;
        }else if(desiredFunction=="setSpreadsheetOld"){
              return await collection.updateOne( {Spreadsheet:true}, { $set:{ isOld:true}});
        }


    }catch(err){
      console.log(err);
      return null;
    }


}







/*
   SECTION : Functions
*/



//The function returns the  date of the last database update
async function getLastUpdated(){

 let spreadsheetObjArr= await collection.find({Spreadsheet:true}).toArray();

 if(spreadsheetObjArr.length==0){return null;}
 else{return spreadsheetObjArr[0]; }


}

//This function returns a preview Object of the current spreadsheet
async function previewSpreadsheet(){
    const sheet = await doc.sheetsByIndex[0]; //get the first sheet of the document

    const rows= await sheet.getRows();//Returns an array of row objects



    await sheet.loadHeaderRow();//Populate the propety headerValues
    const headerRow=await sheet.headerValues;//Get header values

    var sheetDataArray=[];
    for(var i=0; i<rows.length;i++){//Go through each populated row and add to database
        row=rows[i];

        //Filter out unwanted spaces
        valFirstName=row.FirstName.toLowerCase().split(/(\s+)/).filter( function(str){ return str.trim().length>0}).join(" ");
        valLastName=row.LastName.toLowerCase().split(/(\s+)/).filter( function(str){ return str.trim().length>0}).join(" ");
        //console.log(row.FirstName);

        objStr=`{ "FirstName": "${row.FirstName}", "LastName":"${row.LastName}", "item" :{ `;
        //objStr="";
        for( [key, value] of Object.entries(row)){
            if(key!='FirstName' && key!='LastName'&& key!='_sheet' && key!='_rowNumber' && key!='_rowNumber' && key!='_rawData'){
                  if(value==null || value.trim().lenth==0){value=""}

                objStr+=` "${key}" : "${value}",`;
            }


        }
          objStr=objStr.slice(0,objStr.length-1);//Remove last ','
          objStr+=`}}`;

          sheetDataArray.push(JSON.parse(objStr));

    }

    return [doc.title,headerRow,sheetDataArray];


}



async function loadNewSpreadsheet(){//The function saves and clears the current sheet, creating a new google spreadsheet


  await saveSpreadsheet(); //Saving current spreadsheet

  await setDate();
  const sheet = await doc.sheetsByIndex[0];

  givenYear=year;givenMonth=month;givenDay=monthDay;
  console.log("givenYear: "+givenYear+" givenMonth: "+givenMonth+" givenDay:"+givenDay);

  await  doc.updateProperties({title: 'RCCG Ushers - ( '+givenMonth+' '+givenDay+', '+givenYear +' )' });
  await sheet.updateProperties({ title: '( '+givenMonth+' '+givenDay+', '+givenYear +' )'});

  await sheet.loadHeaderRow();//Populate the propety headerValues
  const headerRow=await sheet.headerValues;//Get header values

  await sheet.clear();//Clear the sheet
  await sheet.setHeaderRow(headerRow);//Add Spreadsheet header values

   return await updateSpreadsheetInfo(false,givenYear,givenMonth,givenDay,time24Hrs);

}




//Retrieves neccessary details, stored in the database, to develop multiple graphs
async function getGraphDetails(filter,mode,data){

  if(  mode=='search' && (data==null||data==undefined) ){return null}

  console.log("mode: "+mode+"\n")
  if(mode=='home'){
    const projectObj={FirstName: 0,LastName: 0,_id:0, Spreadsheet:0, year:0,month:0,day:0,time:0,isOld:0,title:0,FullName:0 };
     data = await collection.aggregate( [{$project:projectObj }] ).toArray() ;
     data = data.filter( (obj) => {return Object.keys(obj).length>0});//Remove empty objects
  }else if(mode=='search'){
      delete data[0]['FirstName'];
      delete data[0]['LastName'];
      delete data[0]['FullName'];
      delete data[0]['_id'];
      console.log("data after del: "+JSON.stringify(data));
  }



  let graphs={ totalDonationsVsDate:{}, numOfMembersVsDate:{}, methodOfPaymentVsDate:{}};
  var methodOfPayment_allTypes=new Set();



   data.forEach( (dataObj) =>{

           for([yearKey,yearObj] of Object.entries(dataObj) ){//Iterating through each year key and values

              for([monthKey, monthObj] of Object.entries(yearObj)  ){//Iterating through each month key and values

                      for( [dayKey, dayObj] of Object.entries(monthObj)){//Iterating through each day key and values

                            for( [graphType, graphData] of Object.entries(graphs)   ){   //Appending data to the appropriate graphs

                              filterToKey={'year': `${yearKey}`,'month': `${stringToMonthNumerical[monthKey]+1}/${yearKey}` ,
                                      'day': `${stringToMonthNumerical[monthKey]+1}/${dayKey}/${yearKey}` };

                              var filterKey=filterToKey[filter];
                              if( !Object.keys(graphData).includes(filterKey) && ['totalDonationsVsDate', 'numOfMembersVsDate'].includes(graphType) ){

                                              console.log("monthKey: "+monthKey+" yearKey:"+yearKey );
                                              graphs[graphType][filterKey]=0;
                              }

                              if(graphType == 'totalDonationsVsDate' ){
                                          Object.values(dayObj).filter( (item)=> {return !isNaN(item)}).forEach( (item)=>{
                                                    console.log("numerical values: "+item);
                                                    graphs[graphType][filterKey]+=parseFloat(item);
                                                    console.log("graphs[graphType][`${monthKey} ${yearKey}`]: "+graphs[graphType][filterKey]);
                                            });
                              }else if(graphType == 'numOfMembersVsDate' ){
                                      graphs[graphType][filterKey]+=1;

                              }else if(graphType == 'methodOfPaymentVsDate' ){

                                    for([itemKey,item] of Object.entries(dayObj)){
                                          item.split(",").forEach( (splitItem) =>{
                                                    if(['true','t','yes','y'].includes(splitItem)){

                                                          if(!Object.keys(graphs[graphType]).includes(filterKey)){
                                                                      graphs[graphType][filterKey]={};
                                                          }
                                                          if(!Object.keys(graphs[graphType][filterKey]).includes(itemKey)){
                                                                      methodOfPayment_allTypes.add(itemKey);
                                                                      graphs[graphType][filterKey][itemKey]=0;
                                                          }
                                                          graphs[graphType][filterKey][itemKey]+=1;

                                                    }
                                          });
                                    }
                                }}}}}
        });


  Object.keys(graphs['methodOfPaymentVsDate']).forEach( (date) =>{

          var datePayMethods=Object.keys(graphs['methodOfPaymentVsDate'][date]);
          var allPaymentMethods=Array.from(methodOfPayment_allTypes);

          console.log("datePayMethods: "+JSON.stringify(datePayMethods));
          console.log("\nallPaymentMethods: "+JSON.stringify(allPaymentMethods));

          if(datePayMethods!=allPaymentMethods){
                allPaymentMethods.forEach( (payMethod) =>{
                          if(!datePayMethods.includes(payMethod)){
                                graphs['methodOfPaymentVsDate'][date][payMethod]=0;
                          }
                });
          }
  });

  console.log(graphs);
  return graphs;

}

//Updates the database with the spreadsheet info for backend use
async function updateSpreadsheetInfo(sheetState,givenYear,givenMonth,givenDay,time24Hrs){

  const spreadsheetInfoArray= await collection.find( {Spreadsheet:{$exists:true,$ne:null}   }).toArray();

  if(spreadsheetInfoArray.length==0){
      await collection.insertOne({Spreadsheet:true, year:givenYear,month:givenMonth,day:givenDay,time:time24Hrs,isOld:sheetState,title:doc.title,});
  }else{
      await collection.updateOne( {Spreadsheet:true}, { $set:{ year: givenYear,month:givenMonth,day:givenDay,time:time24Hrs,isOld:sheetState,title:doc.title }  });
  }
  console.log("givenYear: "+givenYear+" givenMonth: "+givenMonth+" givenDay:"+givenDay+ " time24Hrs: "+time24Hrs);

  console.log("updateSpreadsheetInfo: "  + (await collection.find({Spreadsheet:{$exists:true,$ne:null}   }).toArray())[0]);

  return  (await collection.find( {Spreadsheet:{$exists:true,$ne:null}   }).toArray())[0] ;

}


/*
  This function opens the spreadsheet, adding its curent values to the database.
*/

async function saveSpreadsheet(){//mode can 'old' or 'new', signifying whether the sheet is an old or new sheet

  var givenYear,givenMonth,givenDay;


  const sheet = await doc.sheetsByIndex[0]; //get the first sheet of the document
  const rows= await sheet.getRows();//Returns an array of row objects

  let resetedIdStrArr=[];

  const spreadsheetInfoArray= await collection.find( {Spreadsheet:{$exists:true,$ne:null}   }).toArray();

  if(spreadsheetInfoArray.length==0){
      setDate();
      spreadsheetInfoArray=await updateSpreadsheetInfo(false,year,month,monthDay,time24Hrs);

  }

      //console.log(spreadsheetInfoArray);
  givenYear=spreadsheetInfoArray[0].year;
  givenMonth=spreadsheetInfoArray[0].month;
  givenDay=spreadsheetInfoArray[0].day;


  const projectObj={[`${givenYear}`]:1,[`${givenMonth}`]:1,[`${givenDay}`]:1,_id:1  };
  let oldItems = await collection.aggregate( [{$project:projectObj }] ).toArray() ;


  oldItems=oldItems.filter((item)=>{return Object.keys(item).length>1; });

  var oldItem;var setQueryStr;
  for(var i=0;i<oldItems.length;i++){

          oldItem=oldItems[i];
          if(Object.keys(oldItem).includes(givenYear) &&  Object.keys(oldItem[givenYear]).includes(givenMonth)  &&    Object.keys(oldItem[givenYear][givenMonth]).includes(givenDay)){

                let setQuery={};
                resetedIdStrArr.push(oldItem._id.toHexString());
                for([itemKey, item] of Object.entries(oldItem[givenYear][givenMonth][givenDay])){

                     if(isNaN(item)){
                        setQueryStr={[`${givenYear}.${givenMonth}.${givenDay}.${itemKey}`]:''};

                        await collection.updateOne( {_id:oldItem._id }, { $set:setQueryStr  });
                     }else{
                       setQueryStr={[`${givenYear}.${givenMonth}.${givenDay}.${itemKey}`]:'0'};
                       await collection.updateOne( {_id:oldItem._id }, { $set:setQueryStr  });
                     }


                }
          }
      }

  var addedIdStrArr=[];
  var row,header,objStr,valFirstName,valLastName;

  for(var i=0; i<rows.length;i++){//Go through each row and add to database
      row=rows[i];

      //Enforcing desired formating
      valFirstName=row.FirstName.toLowerCase().split(/(\s+)/).filter( function(str){ return str.trim().length>0}).join(" ");
      valLastName=row.LastName.toLowerCase().split(/(\s+)/).filter( function(str){ return str.trim().length>0}).join(" ");

      objStr=` { "FirstName": "${valFirstName}","LastName":"${valLastName}", "FullName":"${valFirstName} ${valLastName}", "${givenYear}" : { "${givenMonth}" : { "${givenDay}" :{    `;

      for( [key, value] of Object.entries(row)){
          if(key!='FirstName' && key!='LastName'&& key!='_sheet' && key!='_rowNumber' && key!='_rowNumber' && key!='_rawData' && ( typeof value=='string' && value.trim().length!=0)  && value!=null){

              //Enforcing desired formating
              value=value.toLowerCase().split(/(\s+)/).filter( function(str){ return str.trim().length>0}).join(" ");
              objStr+=` "${key}" : "${value}",`;
          }


      }

        objStr=objStr.slice(0,objStr.length-1);//Remove last ','
        objStr+='}}}}';


        await addItemToDatabase(objStr);
        addedIdStrArr.push((await collection.find({ FirstName:valFirstName,LastName:valLastName }).toArray())[0]._id.toHexString());

  }



  console.log("resetedIdStrArr: "+resetedIdStrArr);
  console.log("addedIdStrArr: "+addedIdStrArr);

  resetedIdStrArr=resetedIdStrArr.filter((idStr)=>{return !addedIdStrArr.includes(idStr);} );

  var hexString;
  for(var i=0;i<resetedIdStrArr.length;i++){//Removing items that were not updated (removed in edition of spreadsheet)

       hexString = resetedIdStrArr[i];
      // console.log("TYPE OBJ: "+ typeof resetedIdObjArr[index]);
      await collection.updateOne( { _id: ObjectID.createFromHexString(hexString)},{ $unset: { [`${givenYear}.${givenMonth}.${givenDay}`]: "" } });

        let notUpdatedObj=(await collection.find({_id: ObjectID.createFromHexString(hexString)}).toArray())[0];

        console.log(await collection.find({_id: ObjectID.createFromHexString(hexString) }).toArray());

        delete notUpdatedObj[givenYear][givenMonth][givenDay];
        console.log("B4 hex:"+ JSON.stringify(notUpdatedObj)+'\n');

        if(Object.keys(notUpdatedObj[givenYear][givenMonth])==0){
              //await collection.aggregate([{ $unset: [`${givenYear}.${givenMonth}`] }]);
              await collection.updateOne( { _id:ObjectID.createFromHexString(hexString) },{ $unset: { [`${givenYear}.${givenMonth}`]: "" } });

              delete notUpdatedObj[givenYear][givenMonth];
        }
        if(Object.keys(notUpdatedObj[givenYear])==0){
            //  await collection.aggregate([{ $unset: [`${givenYear}`] }]);
            collection.updateOne( { _id: ObjectID.createFromHexString(hexString) },{ $unset: { [`${givenYear}`]: "" } });
              delete notUpdatedObj[givenYear];
        }

        console.log("AFTER hex:"+ JSON.stringify(notUpdatedObj)+'\n');

  }


  if(rows.length>0){//Adding to the Database:  a spreadsheet info object, if there was inputed data
        return await updateSpreadsheetInfo(true,givenYear,givenMonth,givenDay,time24Hrs);
  }else{
    return null;
  }



}



//This function adds items to the database given an objext string;
async function addItemToDatabase(objStr){//mode can 'add' or 'update', signifying whether the database adding new data or updating


  var obj=JSON.parse(objStr);
  //console.log(objStr+'\n');


  const itemFound=await collection.findOne({ FirstName:obj.FirstName,LastName:obj.LastName });

  if(itemFound==null){//user is not in database
      await collection.insertOne(obj); //Input a user in the database

  }else{//User is already in database

    var yearState,monthState,dayState;
    var yearKey,monthKey,dayKey;
    yearState=monthState=dayState=false;
    var objMonthObj,objDayObj,itemMonthObj,itemDayObj;


     for([objKey,objYearObj] of Object.entries(obj) ){//Checking where to input the data in the existing user object (setting neccessary flags)

         for([itemKey,itemYearObj] of Object.entries(itemFound) ){

             if(objKey== itemKey && objKey!="FirstName" && objKey!="LastName"){
                    //console.log("objKey: "+objKey+ " itemKey: "+itemKey);
                    yearState=true;
                    yearKey=objKey;
                    objMonthObj=obj[objKey];
                    itemMonthObj=itemFound[itemKey];

                    for([objMonthKey,objDayObj] of Object.entries(objMonthObj) ){
                        for([itemMonthKey,itemDayObj] of Object.entries(itemMonthObj) ){
                              //  console.log("objMonthKey: "+objMonthKey+ " itemMonthKey: "+itemMonthKey);

                                if(objMonthKey==itemMonthKey){
                                  //console.log("objMonthKey: "+objMonthKey+ " itemMonthKey: "+itemMonthKey);
                                    monthState=true;
                                    monthKey=objMonthKey;
                                    objDayObj=objMonthObj[objMonthKey];
                                    itemDayObj=itemMonthObj[itemMonthKey];

                                    for([objDayKey,objDataObj] of Object.entries(objDayObj) ){
                                        for([itemDayKey,itemDataObj] of Object.entries(itemDayObj) ){

                                                  if(itemDayKey==objDayKey){
                                                      //console.log("itemDayKey: "+itemDayKey+ " objDayKey: "+objDayKey);
                                                      dayKey=itemDayKey;
                                                      dayState=true;
                                                  }
         }}}}}}}}}


         yearProperty=Object.keys(obj)[0];
         monthProperty=Object.keys(obj[yearProperty]);
         dayProperty=Object.keys(obj[yearProperty][monthProperty]);

         console.log("yearProperty: "+yearProperty+" monthProperty: "+monthProperty+ " dayProperty: "+dayProperty);

         //Analysing the flags to determine the appropriate insert implementation
         if( yearState==false && monthState==false && dayState==false){//user has a new year property
            await collection.updateOne( {"FirstName":obj.FirstName, "LastName": obj.LastName}, { $set:{ [yearProperty]: obj[yearProperty] }  });

         }else if( yearState==true && monthState==false && dayState==false){//user has an existing year property, but new month property
            await collection.updateOne( {"FirstName":obj.FirstName, "LastName": obj.LastName}, { $set:{ [`${yearProperty}.${monthProperty}`]: obj[yearProperty][monthProperty] }  });

         }else if( yearState==true && monthState==true && dayState==false){//user has an existing year property, existing month property, but new day property
            await collection.updateOne( {"FirstName":obj.FirstName, "LastName": obj.LastName}, { $set:{ [`${yearProperty}.${monthProperty}.${dayProperty}`]: obj[yearProperty][monthProperty][dayProperty] }  });

         }else if( yearState==true && monthState==true && dayState==true){//user has an existing year property, existing month property, existing day property


            if(!Object.keys(itemFound).includes(yearProperty)){
                itemFound[yearProperty]={};
            }
            if(!Object.keys(itemFound[yearProperty]).includes(monthProperty)){
                itemFound[yearProperty][monthProperty]={};
            }
            if(!Object.keys(itemFound[yearProperty][monthProperty]).includes(dayProperty)){
                itemFound[yearProperty][monthProperty][dayProperty]={};
            }

            objDayObj=obj[yearProperty][monthProperty][dayProperty];
            itemDayObj=itemFound[yearProperty][monthProperty][dayProperty];

            var resultStr,total;

            for([objItemKey, item] of Object.entries(objDayObj)  ){

                  if(Object.keys(itemDayObj).includes(objItemKey)){
                      if(isNaN(item)){
                        itemDayObj[objItemKey]=(function(){
                                  if(objDayObj[objItemKey].split(/(\s+)/).filter( function(str){ return str.trim().length>0}).length==0 ){
                                     return itemDayObj[objItemKey];
                                  }else if (itemDayObj[objItemKey].split(/(\s+)/).filter( function(str){ return str.trim().length>0}).length==0 ){
                                    return objDayObj[objItemKey];
                                  }else if (itemDayObj[objItemKey].split(/(\s+)/).filter( function(str){ return str.trim().length>0}).length==0 && objDayObj[objItemKey].split(/(\s+)/).filter( function(str){ return str.trim().length>0}).length==0 ){
                                    return '';
                                  }else {
                                    return objDayObj[objItemKey]+','+itemDayObj[objItemKey];
                                  }
                        })();

                      }else{
                          itemDayObj[objItemKey]=(parseFloat(objDayObj[objItemKey])+parseFloat(itemDayObj[objItemKey])).toString();
                      }
                  }else{

                    itemDayObj[objItemKey]=objDayObj[objItemKey];
                  }


            }

              console.log(" AFTER: itemDayObj: "+JSON.stringify(itemDayObj));

            await collection.updateOne( {"FirstName":obj.FirstName, "LastName": obj.LastName}, { $set:{ [`${yearProperty}.${monthProperty}.${dayProperty}`]: itemDayObj }  });



         }

}



//This function searchs the database, returning the query results
async function searchDatabase(mode,queryStr){

    queryStr=queryStr.toLowerCase();

    if(queryStr.trim().length==0){return null;} //Return null if queryStr is an empty string

    if(mode=='name'){//Format: ANY , Could be (LastName FirstName ) OR (FirstName LastName)
                    //WHERE FirstName and LastName can store multiple values to represent middle names

        return await collection.find( {FullName: { $regex:queryStr, $options:'i' }} ).toArray();

    }else if (mode=='year'){//Format: year


        var queryArr = queryStr.split(/(\s+)/).filter( function(str){ return str.trim().length>0});

        if(queryArr.length!=1){  return null;}//Return null if there is more than one input

        var givenYear=queryArr[0];

        if(!dateModule.isValidDate("year",givenYear) ){return null}//Return null if year is invalid

        var yearExistArray=await collection.find( {[`${givenYear}`]:{$exists:true,$ne:null}   }).toArray();//This array informs whether  the year exists or not
        //console.log(result);

        if(yearExistArray.length>0){
          let finalResult= await collection.aggregate( [{$project: {[`${givenYear}`]:1, FirstName: 1,LastName: 1,_id:0 }}] ).toArray();
           finalResult=finalResult.filter( function (item){return Object.keys(item).length>0 });//Filter empty objects

           finalResult.forEach((member) =>{
                delete member['FirstName'];
                delete member['LastName'];
                delete member['FullName'];
           })

           console.log("finalResult: "+JSON.stringify(finalResult) );
           return finalResult;

        }else{
            return null;
        }

    }else if(mode=='yearMonth'){//Format: YEAR/MONTH   - Month can be in the numerical or written format

        var queryArr = queryStr.split(/(\s+)/).filter( function(str){ return str.trim().length>0}).join("").split("/");

        if(queryArr.length!=2){return null}//Return null as format is incorrect

        var givenYear=queryArr[0];var givenMonth=queryArr[1];

        if(!isNaN(givenMonth)){//Convert month to written form if in numerical form
          givenMonth=monthNumericalToString[parseInt(givenMonth)-1];
        }
        //console.log("givenYear: "+givenYear+ "givenMonth: "+givenMonth);

        if(!dateModule.isValidDate("month",givenYear,givenMonth)){return null}//Return null if year/month is invalid

        var yearMonthExistArray=await collection.find( {[`${givenYear}.${givenMonth}`]:{$exists:true,$ne:null}   }).toArray();//This array informs whether  the year/month  exists or not

        //console.log(yearMonthExistArray);

        if(yearMonthExistArray.length>0){

          let finalResult = await collection.aggregate( [{$project: {[`${givenYear}.${givenMonth}`]:1, FirstName: 1,LastName: 1,_id:0 }}] ).toArray();

          finalResult.forEach((member) =>{
               delete member['FirstName'];
               delete member['LastName'];
               delete member['FullName'];
          });

          console.log("finalResult: "+JSON.stringify(finalResult) );

          return finalResult.filter( function (item){return Object.keys(item).length>0 });
        }else{
          return null;
        }


        console.log(queryArr);
    }else if(mode=='yearMonthDay'){//Format: YEAR/MONTH/DAY   - Month can be in the numerical or written format

      var queryArr = queryStr.split(/(\s+)/).filter( function(str){ return str.trim().length>0}).join("").split("/");

      if(queryArr.length!=3){return null}//Return null as format is incorrect

      var givenYear=queryArr[0];var givenMonth=queryArr[1];var givenDay=queryArr[2];

      if(!isNaN(givenMonth)){//Convert month to written form if in numerical form
        givenMonth=monthNumericalToString[parseInt(givenMonth)-1];
      }

      if(!dateModule.isValidDate("day",givenYear,givenMonth,givenDay)){return null}//Return null if year/month/day is invalid

        var yearMonthDayExistArray=await collection.find( {[`${givenYear}.${givenMonth}.${givenDay}`]:{$exists:true,$ne:null}   }).toArray();//This array informs whether  the year/month/day  exists or not

        //console.log(yearMonthDayExistArray);
        if(yearMonthDayExistArray.length>0){
          let finalResult = await collection.aggregate( [{$project: {[`${givenYear}.${givenMonth}.${givenDay}`]:1, FirstName: 1,LastName: 1,_id:0 }}] ).toArray() ;

          finalResult.forEach((member) =>{
               delete member['FirstName'];
               delete member['LastName'];
               delete member['FullName'];
          });

          console.log("finalResult: "+JSON.stringify(finalResult) );

          return finalResult.filter( function (item){return Object.keys(item).length>0 })
        }else{
          return null;
        }


    }

}






//Load Spreadsheet based on the date with database info
async function loadOldSpreadsheet(givenYear,givenMonth,givenDay){

        if(!isNaN(givenMonth)){//Convert month to written form if in numerical form
          givenMonth=monthNumericalToString[parseInt(givenMonth)-1];
        }

        if(!dateModule.isValidDate('day',givenYear, givenMonth, givenDay)){return null;}
        // //Return null if the day is invalid
        // if(parseInt(givenDay)<1 || parseInt(givenDay)>monthToNumOfDay[givenMonth]){return null}

        //  var tempResult=await collection.find( { $and: [ {FirstName: { $regex:possibilitiesArr[i][0] }}, {LastName: { $regex:possibilitiesArr[i][1] }} ]} ).toArray();

       var yearMonthDayExistArray=await collection.find( {[`${givenYear}.${givenMonth}.${givenDay}`]:{$exists:true,$ne:null}   }).toArray();//This array informs whether  the year/month/day  exists or not

        const sheet =await doc.sheetsByIndex[0];//Get the first sheet

        //Update sheet name
        await  doc.updateProperties({title: 'RCCG Ushers - ( '+givenMonth+' '+givenDay+', '+givenYear +' )' })
        await sheet.updateProperties({ title: '( '+givenMonth+' '+givenDay+', '+givenYear +' )'});


        await sheet.loadHeaderRow();//Populate the propety headerValues
        const headerRow=await sheet.headerValues;//Get header values

        await sheet.clear();//Clear the sheet
        await sheet.setHeaderRow(headerRow);//Add Spreadsheet header values

        var dayObj,nameObj;

        for(var i=0;i<yearMonthDayExistArray.length;i++){//Add the found items to spreadsheet
              dayObj=yearMonthDayExistArray[i][givenYear][givenMonth][givenDay];
              nameObj= {FirstName:yearMonthDayExistArray[i].FirstName,LastName:yearMonthDayExistArray[i].LastName};
              // console.log(dayObj);
              // console.log(nameObj);
              //console.log(Object.assign(nameObj,dayObj));

              await sheet.addRow(Object.assign(nameObj,dayObj));
        }

        if(yearMonthDayExistArray.length>0){

            return await updateSpreadsheetInfo(true,givenYear,givenMonth,givenDay,time24Hrs);
        }

}

function setDate(){//Adds the current date to file
      var dataObj=dateModule.updateDate();
      year=dataObj.year;
      month=dataObj.month;
      monthDay=dataObj.monthDay;
      time24Hrs=dataObj.time;
}
