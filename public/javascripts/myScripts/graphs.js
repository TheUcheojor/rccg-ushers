/*

    This file is for creating and managing graphs for users that
    detail the flow of donations,  members, and etc  over time

*/

var currentGraphIndex=0;
var graphTypeToTitle={ 'totalDonationsVsDate': 'Total Donations v Time ','numOfMembersVsDate':'Number of Members v Time',
                    'methodOfPaymentVsDate':'Frequency of Payment Method v Time'};

var graphTypeToYxis={ 'totalDonationsVsDate': 'Total Donations','numOfMembersVsDate': 'Number of Members',
                    'methodOfPaymentVsDate':'Frequency of Payment Method'};

var graphTypeToLegend={ 'totalDonationsVsDate': false,'numOfMembersVsDate':false,'methodOfPaymentVsDate':true};




function nextGraph(direction){
    currentGraphIndex+=direction;
    currentGraphIndex%=$('.myGraph').length;
    $('.myGraph').hide();
    $('.myGraph').eq(currentGraphIndex).show();
}


function fitToContainer(canvas){//adjust canvas

    canvas.parentNode.style.height = '100%';
    canvas.parentNode.style.width = '100%';
    canvas.style.width='100%';
    canvas.style.height='100%';
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

  }

// Generates the details for graphs:
// Graphs are the following: totalDonationsVsDate, numOfMembersVsDate, methodOfPaymentVsDate
function generateGraphs(mode,graphType,graphData,filter){

    if(mode==null||mode==undefined){return;}

    //console.log("graphData: "+JSON.stringify(graphData) );

    var canvas=$('.'+mode+"Canvas"+graphType.charAt(0).toUpperCase()+graphType.slice(1))[0];

    fitToContainer(canvas);

    var filterToMomentTimeFormat={"year":"YYYY","month":"MM-YYYY","day":"MM-DD-YYYY" };

    var momentTimeFormat=filterToMomentTimeFormat[filter];

    ////console.log("timeFormat: "+timeFormat);

      if( ['totalDonationsVsDate','numOfMembersVsDate'].includes(graphType)){

            let xValues=sortDates(Object.keys(graphData),'num');

            xValues.forEach((xVal,index)=>{
                    // xValues[index]= capitalize(xVal)}
                    //console.log("date:"+ xValues[index]);
                    xValues[index]=moment(xValues[index], momentTimeFormat);

                  });


            let yValues=Object.values(graphData);

            var ctx = canvas.getContext('2d');

            var y_dataset= [{data: yValues,fill:false,backgroundColor: 'rgba(153, 102, 255, 0.4)',
                           borderColor:'rgba(153, 102, 255, 1)',borderWidth: 1}];

            createCanvas(ctx,xValues, y_dataset,graphType,filter);
      }


      if( ['methodOfPaymentVsDate'].includes(graphType)){
          let xValues=sortDates(Object.keys(graphData),'num');

          //console.log("xValues: "+JSON.stringify(xValues));

          yKeyToColorScheme={ 'Cheque': 'rgba(181, 162, 199,0.8)','Cash': 'rgba(199, 162, 181,0.8)',
                              'Debit':'rgba(162, 181, 199,0.8)'};

          let y_dataset=[];let yValuesObj={};
          xValues.forEach( (xkey, xindex)=> {

                  xValues[xindex]=moment(xValues[xindex], momentTimeFormat);
                  for( [yKey,yVal] of Object.entries(graphData[xkey])){

                    if(Object.keys(yValuesObj).includes(yKey) ){
                        yValuesObj[yKey].push(yVal);
                    }else{
                        yValuesObj[yKey]=[yVal];
                    }

                  }
          });

          //console.log("yValuesObj: "+ JSON.stringify(yValuesObj));

          for([yLabel,yValues] of Object.entries(yValuesObj)){
                    y_dataset.push({
                          label:yLabel,
                          fill:false,
                          backgroundColor:yKeyToColorScheme[yLabel],
                          borderColor:yKeyToColorScheme[yLabel],
                          data:yValuesObj[yLabel],
                    });
          }

          //xValues.forEach((xVal,index)=>{ xValues[index]= capitalize(xVal)});
          var ctx = canvas.getContext('2d');

          createCanvas(ctx,xValues, y_dataset,graphType,filter);


      }


}


//This function adds a graph to a given canvas
function createCanvas(ctx,xValues, y_dataset,graphType,filter){

  var myChart = new Chart(ctx, {
                                  type: 'line',
                                  data: {
                                            labels: xValues,
                                            datasets:y_dataset
                                  },
                                  options: {
                                              maintainAspectRatio: false,
                                              responsive:true,
                                              legend:{
                                                    display:graphTypeToLegend[graphType]
                                              },
                                              title:{
                                                  display:true,
                                                  text:graphTypeToTitle[graphType]
                                              },
                                              scales: {
                                              yAxes: [{
                                                  ticks: {
                                                      beginAtZero: true
                                                  },
                                                  scaleLabel:{
                                                        display:true,
                                                        labelString:graphTypeToYxis[graphType]
                                                  }

                                              }],
                                              xAxes: [{
                                                  type:'time',
                                                  time:{
                                                      unit:filter,
                                                      displayFormats: {
                                                            day: 'MMM DD YYYY'
                                                        }
                                                  },
                                                   distribution: 'series'

                                              },
                                            ],

                                          }
                                  }
                });

}


//This functions sorts a given array of string dates: forms include YEAR, MONTH/YEAR, and MONTH/DAY/YEAR
function sortDates(dates, monthOuputPreference){//monthOuputPreference can be num or text [Referring to the month]

	var monthNumericalToString={  1:"janurary",2:"feburary",3:"march",4:"april",5:"may",6:"june",
                    7:"july",8:"august",9:"september",10:"october",11:"november",12:"december"};

var stringToMonthNumerical={"janurary":1,"feburary":2,"march":3,"april":4,"may":5,"june":6,"july":7,
              "august":8,"september":9,"october":10,"november":11,"december":12};

    var sortedDates=[];

	if(dates==null||dates==undefined||dates.length==0){
    		return;
    }

    dates.forEach( (date,dateIndex)=>{//Break dates array into 2-d array of date components
          sortedDates[dateIndex]=[];
          date.split('/').forEach( (dateComp,index)=>{

          		if(isNaN(dateComp)){

                		sortedDates[dateIndex].push(stringToMonthNumerical[dateComp]);
                }else{
                	sortedDates[dateIndex].push(parseInt(dateComp));
                }



              });
    });


    if(sortedDates[0].length==1){//Sort YEAR
    		sortedDates.sort((a,b)=>{return a-b;})

    }else if(sortedDates[0].length==2){//Sort YEAR/MONTH
            sortedDates.sort((a,b)=>{return a[0]-b[0];});//sort month
            sortedDates.sort((a,b)=>{return a[1]-b[1];});//sort year

    }else if(sortedDates[0].length==3){//SORT YEAR/MONTH/DAY
    		  sortedDates.sort((a,b)=>{return a[1]-b[1];});//sort day
            sortedDates.sort((a,b)=>{return a[0]-b[0];});//sort month
            sortedDates.sort((a,b)=>{return a[2]-b[2];});//sort year
    }

	sortedDates.forEach( (dateArray, arrIndex)=>{//Turing 2-d array into 1-d string array

                  if(dateArray.length!=1 && monthOuputPreference=='text' ){

                  	dateArray[0]=monthNumericalToString[ dateArray[0] ];
                  }

                  dates[arrIndex]=dateArray.join('/');
    });

    return dates;

}
