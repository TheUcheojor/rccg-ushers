
/*
  This functions updates the current date.
  Necessary for the organization of the database
*/
function updateDate(){//Gets the current date, while formating it
  var date=new Date();
  var year=date.getFullYear().toString();
  var month= monthNumericalToString[date.getMonth()];
  var monthDay=date.getDate().toString();
  var hourObj=convert24To12Hr(date.getHours());

  var minutes=function(){
                      if(date.getMinutes().toString().length==1){
                          return "0"+date.getMinutes()
                      }else{return date.getMinutes();}
                }

  var time=hourObj.hour.toString() + ":"+minutes() + hourObj.timeOfDay;

   return {"year": year,"month": month,"monthDay":monthDay, time:time};

}

function convert24To12Hr(hr){//converts 24 hr time to 12 hour time
      if(hr==0){ return {hour:"12",timeOfDay:"AM" }  }
      if(hr<12){return {hour:hr.toString(),timeOfDay:"AM" }}
      if(hr==12){return {hour:hr.toString(),timeOfDay:"PM" }}
      if(hr>12){return {hour:(hr-12).toString(),timeOfDay:"PM" }}
}


//This function checks if the a given date is valid
function isValidDate(mode,givenYear, givenMonth, givenDay){

      var flagYear,flagMonth,flagDay;

      if(!isNaN(givenYear) && givenYear.length==4){//Check if a valid year was given
          flagYear=true
      }else{
          flagYear=false;
      }

      //Check if a valid month was given
      if(mode!='year' && isNaN(givenMonth) && allMonths.includes(givenMonth) ){
          flagMonth=true;
      }else{
          flagMonth=false;
      }

      //check if a value day was given
      if(mode!='year' && mode!='month' && parseInt(givenDay)>0 && parseInt(givenDay)<=monthToNumOfDay[givenMonth] ){
          flagDay=true
      }else{
          flagDay=false;
      }


      if(mode=='year'){
            return flagYear
      }else if(mode=='month'){
            return flagYear && flagMonth;
      }else if(mode=='day'){
            return flagYear && flagMonth && flagDay;
      }

}



var monthNumericalToString={  0:"janurary",1:"feburary",2:"march",3:"april",4:"may",5:"june",
                    6:"july",7:"august",8:"september",9:"october",10:"november",11:"december"};

var stringToMonthNumerical={"janurary":0,"feburary":1,"march":2,"april":3,"may":4,"june":5,"july":6,
              "august":7,"september":8,"october":9,"november":10,"december":11};

var allMonths=["janurary","feburary","march","april","may","june","july","august","september","october","november","december"];
var monthToNumOfDay={"janurary":31,"feburary":29 ,"march":31,"april":30,"may":31,
                  "june":30,"july":31,"august":31,"september":30,"october":31,"november":30,"december":31 };



// module.exports.updateDate =updateDate;
// module.exports.isValidDate =isValidDate;
//
// module.exports.year =year;
// module.exports.month =month;
// module.exports.monthDay =monthDay;

module.exports={
    monthNumericalToString:monthNumericalToString,
    allMonths:allMonths,monthToNumOfDay:monthToNumOfDay,
    updateDate:updateDate, isValidDate:isValidDate,
    stringToMonthNumerical:stringToMonthNumerical,
}
