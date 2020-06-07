/*

 This  JS Document focuses on search features

*/


onkeyup="$('hbs-body-container').hide();$('search').fadeIn();search(this.value)"

window.onclick = function(event) {
      if (event.target == $('.result-preview-container')[0]) {
        $('.result-preview-container').hide();
        $('.result-preview-container').html(`

              <div class="result-preview-content">
                        <div class="filterBy" id="year-filter">Filter By Year</div>
                        <div class="filterBy" id="month-filter" >Filter By Month</div>
                        <div class="filterBy" id="day-filter" >Filter By Day  </div>
              </div>`);
      }
};




function search(searchStr){

    var mode;
    var redFlag=false;

    $('.result-table').html('');
    if(searchStr.trim().length==0){$('.no-results').show();return;}


    console.log(searchStr);
    if(searchStr.indexOf('/')>-1){//Search Option  YEAR/MONTH or YEAR/MONTH/DAY

        var searchArr= searchStr.split(/(\s+)/).filter( function(str){ return str.trim().length>0}).join("").split("/");

        var redFlag=false;
        searchArr.forEach((item) => {
                if(!isNaN(item) &&item.length>4 ){
                    redFlag=true;
                }
        });

        console.log('YEAR/Month/.. redFlag: '+redFlag);
        if(redFlag){$('.no-results').show(); return;}

        if(searchArr.length==2){ mode='yearMonth';}
        else if(searchArr.length==3){ mode='yearMonthDay';}
        else{ return;}

        searchStr=searchArr.join('/');


    }else if(!isNaN(searchStr)){//Search Option : YEAR
        mode='year';
        if(searchStr.length!=4){$('.no-results').show();return;}

        console.log('YEAR redFlag: '+redFlag);

    }else{//Search Option: NAME

        searchStr.split('').forEach( (char)=> {
                if(!isNaN(char)){
                    redFlag=true;
                }
        });

        console.log('name redFlag: '+redFlag);
        if(redFlag){$('.no-results').show();return}
        // var hasNumber='/\d/';
        // console.log("(hasNumber.test(searchStr): "+hasNumber.test(searchStr));
        // if(hasNumber.test(searchStr)){return;}

        mode='name';

    }

    console.log("mode: "+mode);
    console.log('AFTER : '+searchStr);
    console.log(`/searchDatabase/`+mode+"/"+encodeURIComponent(searchStr));

    $.ajax({
      type : "GET",
      contentType : "String",
      url : `/internals/searchDatabase/${mode}/${encodeURIComponent(searchStr)}`,
      success :function(data){

              if(data.length==0||data==null){
                  $('.result-table').html('');
                  $('.no-results').fadeIn();
                  return;
                }

              console.log("data: "+JSON.stringify(data));
              if(!Array.isArray(data)){
                  console.log("You have been logged out");
                  window.location.href="/";
              }


              // console.log("mode :"+mode);


              var htmlString='';

              if(mode=='name'){

                     htmlString=`
                                  <tr>
                                      <th>First Name</th>
                                      <th>Last Name</th>
                                      <th></th>
                                    </tr>`;



                    data.forEach((item) => {

                          htmlString+=`
                                      <tr>
                                            <td> ${capitalize(item.FirstName)} </td>
                                            <td>${capitalize(item.LastName)} </td>
                                            <td class='result-preview-button' onclick='openResultPreview("name", {data:${JSON.stringify(item)}})'>Prevew Details</td>
                                      </tr>`;

                    });



              }else  if(['year','yearMonth','yearMonthDay'].includes(mode)){

                    var modeToTableHead={"year":"Year","yearMonth":"Year/Month","yearMonthDay":"Year/Month/Day" };

                     htmlString=`
                                  <tr>
                                      <th colspan="2">${modeToTableHead[mode]}</th>
                                      <th></th>
                                    </tr>`  ;

                    htmlString+=`
                                    <tr>
                                          <td colspan="2">${searchStr.toLowerCase()}</td>
                                          <td class='result-preview-button' onclick='openResultPreview("date", { data: ${JSON.stringify(data)},date:"${searchStr.toLowerCase()}"})'>Prevew Details</td>
                                    </tr>`;

            }


              $('.result-table').hide();
              $('.no-results').hide();
              $('.result-table').html(htmlString);
              $('.result-table').show();
       },
      error : function(e) {alert("Error!");}
    });
}


function openResultPreview(mode, paramsObj){


        $('.result-preview-container').show();
        if(mode=='name' ){paramsObj.data=[paramsObj.data];}

        $(`#year-filter`).click( ()=>{
        //  console.log("2 -filterOptionToMode[filterOptions[i]]: "+filterMode);

          $.ajax({
                  url: '/internals/getMemberGraph',
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify({member:paramsObj.data, filter:'year' } ),
                  dataType: 'json',
                  success: function(memberGraph){
                        console.log("mode: "+mode)
                        console.log("memberGraph: "+JSON.stringify(memberGraph));
                        if(mode=='name' ){ filterNameResult(paramsObj.data[0],'year',memberGraph);}
                        else if(mode=='date'){ filterDateResult(paramsObj.data,'year',memberGraph,paramsObj.date);}

                  },
                 error : function(e) {alert("Error!");}
              });
        } );


        $(`#month-filter`).click( ()=>{
        //  console.log("2 -filterOptionToMode[filterOptions[i]]: "+filterMode);
          $.ajax({
                  url: '/internals/getMemberGraph',
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify({member:paramsObj.data, filter:'month' } ),
                  dataType: 'json',
                  success: function(memberGraph){
                        console.log("memberGraph: "+JSON.stringify(memberGraph));
                          if(mode=='name' ){filterNameResult(paramsObj.data[0],'month',memberGraph);}
                          else if(mode=='date'){filterDateResult(paramsObj.data,'month',memberGraph,paramsObj.date);}
                  },
                 error : function(e) {alert("Error!");}
              });
        } );

        $(`#day-filter`).click( ()=>{
        //  console.log("2 -filterOptionToMode[filterOptions[i]]: "+filterMode);
          $.ajax({
                  url: '/internals/getMemberGraph',
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify({member:paramsObj.data, filter:'day' } ),
                  dataType: 'json',
                  success: function(memberGraph){
                        console.log("memberGraph: "+JSON.stringify(memberGraph));
                        if(mode=='name' ){filterNameResult(paramsObj.data[0],'day',memberGraph);}
                        else if(mode=='date'){filterDateResult(paramsObj.data,'day',memberGraph,paramsObj.date);}
                  },
                 error : function(e) {alert("Error!");}
              });
        } );


}


function filterDateResult(data,filter,graphs,title){

  $('.filterBy').fadeOut();
  console.log("data: "+JSON.stringify(data));

  var overviewMain=developMultiOverview(data,filter);
  var fileName=title;
  var title=`YEAR ${title}`;
  developHtmlResults('date',overviewMain, title,graphs,filter,fileName);

}


function filterNameResult(data,filter, graphs){

        $('.filterBy').fadeOut();
        //var overviewData={'FirstName': data['FirstName'],'LastName': data['LastName']};
        overviewData=developOverview(data,{},filter);

        console.log(overviewData);
        var title=`${capitalize(data['FirstName'])} ${capitalize(data['LastName'])}`;
        var fileName=capitalize(data['FirstName'])+"_"+capitalize(data['LastName']);
        developHtmlResults('name',overviewData, title,graphs,filter,fileName);

}




function developMultiOverview(data,filter){//Develop overview for an array of data object

  var overviewMain={};

  data.forEach((memberData) =>{

        var overviewMember=developOverview(memberData,{},filter);

        // console.log("Object.keys(overviewMain): "+Object.keys(overviewMain)[0]);
        // console.log("Object.keys(overviewMember): "+Object.keys(overviewMember)[0]);
        // console.log( "State: "+(Object.keys(overviewMain)[0]!=Object.keys(overviewMember)[0]));

           Object.keys(overviewMember).forEach( (overviewMemberKey)=>{

                  if(!Object.keys(overviewMain).includes(overviewMemberKey) ){
                        overviewMain[overviewMemberKey]=overviewMember[overviewMemberKey];

                  }else{
                    Object.keys(overviewMember[overviewMemberKey]).forEach( (overviewMemberCategory)=>{

                            if(!Object.keys(overviewMain[overviewMemberKey]).includes(overviewMemberCategory) ){
                                  overviewMain[overviewMemberKey][overviewMemberCategory]=overviewMember[overviewMemberKey][overviewMemberCategory];
                            }else{

                                    Object.keys(overviewMember[overviewMemberKey][overviewMemberCategory]).forEach( (overviewMemberSubCategory)=>{

                                        if( !Object.keys(overviewMain[overviewMemberKey][overviewMemberCategory]).includes(overviewMemberSubCategory) ){

                                            overviewMain[overviewMemberKey][overviewMemberCategory][overviewMemberSubCategory]=overviewMember[overviewMemberKey][overviewMemberCategory][overviewMemberSubCategory];

                                        }else{
                                            overviewMain[overviewMemberKey][overviewMemberCategory][overviewMemberSubCategory]+=overviewMember[overviewMemberKey][overviewMemberCategory][overviewMemberSubCategory];
                                        }
                                    } );
                            }
                  });
                }
            } );
  });


  console.log(" B4 overviewMain: "+JSON.stringify(overviewMain));
  //console.log("graphs: "+JSON.stringify(graphs));

  var orderedDateKeys=sortDates(Object.keys(overviewMain),'text');

  console.log("Object.keys(overviewMain): "+JSON.stringify(Object.keys(overviewMain)));
  console.log("orderedDateKeys: "+JSON.stringify(orderedDateKeys));
  var ordedOverviewMain={};

  orderedDateKeys.forEach((key)=>{

          ordedOverviewMain[key]=overviewMain[key];

  });

  console.log("ordedOverviewMain: "+JSON.stringify(ordedOverviewMain));

  return ordedOverviewMain;


}


//Generates the html elements for a given search result
function developHtmlResults(mode,overviewData, title,graphs,filter,fileName){



              var idOffset=-1;
              var htmlString=`
                                <div class="fullResults-container">


                                <table class="result-table inner" id="result-table-${idOffset+=1}" style="position:sticky;top:0;background:rgba(136, 135, 156,1);">
                                  <thead>
                                        <tr>
                                              <th colspan="2" style="border-radius:10px;text-align:center;"><h2>${title}</h2></th>
                                        </tr>
                                  </thead>
                                </table>

                            `;


              if(Object.keys(overviewData).length==0 ){

                      htmlString+=`<div style="width:80%;margin:auto;padding:10px 0px;color:white;font-size:18px; display:inline-block;border-radius:5px; background-color: rgba(136, 135, 156,1);">
                                No Data Found </div> `;

                      $('.result-preview-content').html(htmlString);
                      return;

              }else{


                htmlString+=`<div class="searchGraph-container" id="searchGraph-container-0" >
                                  <canvas class=" searchGraph searchCanvasTotalDonationsVsDate">
                                  </canvas>
                        </div>
                        <div class="searchGraph-container" id="searchGraph-container-1">
                              <canvas class="searchGraph searchCanvasMethodOfPaymentVsDate">
                              </canvas>
                        </div>`;

              }







              if(mode=='date'){

                htmlString+=`<div class="searchGraph-container" id="searchGraph-container-2">
                                    <canvas class="searchGraph searchCanvasNumOfMembersVsDate">
                                    </canvas>
                          </div>;`
              }


              for([categoryKey,categoryObj] of Object.entries(overviewData)){//Disolay user data filtered by year,month or day
                    if(!['FirstName','LastName'].includes(categoryKey)){
                          htmlString+=`
                                <table class="result-table inner" id="result-table-${idOffset+=1}">
                                      <thead>
                                          <tr>
                                                <th colspan="2" style="text-transform: uppercase;border-radius:10px;text-align:left;"> ${categoryKey.toUpperCase()} </th>
                                          </tr>

                                      </thead>
                                <tbody>
                                    `;

                       for([subCatKey,subCatObj] of Object.entries(categoryObj)){
                              htmlString+=`

                                                <tr>
                                                  <td colspan="2" style="background-color:#eee; font-size:17px; text-align:center; ">${subCatKey}</td>
                                                </tr>


                                          `;


                            for([key,val] of Object.entries(subCatObj)){
                              htmlString+=`
                                          <tr>
                                              <td style="background-color:white;">${key}</td>
                                              <td style="background-color:white;">${val}</td>
                                          </tr>`;

                            }

                            //htmlString+=``;


                       }
                       htmlString+=`</tbody></table>`;
                      // htmlString+=`<tr><th colspan="2"></th> </tr>`;

                    }



            }

            htmlString+=`</div>`;

            $('.result-preview-content').html(htmlString);

            var footer=`<div class="downloadData-button" )">
                                  Download PDF
                            </div>`;

            $('.result-preview-container').append(footer);


            $('.downloadData-button').click( ()=>{

              $('.downloadData-button').html('<img src="/images/loading.gif" style="width:25px;height:25px;" />');
              pdfDownload(mode,fileName);

            });

            for([graphType,graphData] of Object.entries(graphs)){
                    if(graphType!="numOfMembersVsDate" && mode=='name'){
                          generateGraphs('search',graphType,graphData,filter);
                    }

                    if(mode=='date'){
                          generateGraphs('search',graphType,graphData,filter);

                    }

            }


}




//Generate an overview data set to be displayed to users
function developOverview(data,overviewData,filter){

  for([yearKey,yearObj] of Object.entries(data) ){

                if(!['FirstName', 'LastName', 'FullName','_id'].includes(yearKey)){

                        if (filter=='year') {overviewData[yearKey]={}; }

                        for([monthKey,monthObj] of Object.entries(yearObj)){

                              if (filter=='month') {overviewData[`${monthKey}/${yearKey}`]={}; }

                              for([dayKey,dayObj] of Object.entries(monthObj)){

                                  if (filter=='day') {overviewData[`${monthKey}/${dayKey}/${yearKey}`]={};}

                                  for([itemKey,item] of Object.entries(dayObj)){

                                      var filterToKey={'year':yearKey ,'month':`${monthKey}/${yearKey}`,'day':`${monthKey}/${dayKey}/${yearKey}` };

                                      var category='';

                                      if(isNaN(item)){

                                            var flagPaymentType=false;
                                            item.split(',').forEach( (miniItem)=>{
                                                  if(['yes','y','true','t','no','n','false','f'].includes(miniItem)){
                                                        flagPaymentType=true;
                                                  }
                                            });
                                            if(flagPaymentType){
                                                category='Payment Method';
                                            }else{
                                                category='Extra Details';
                                            }

                                      }else{
                                          category='Donations';

                                      }


                                      if(! Object.keys(overviewData[ filterToKey[filter]]).includes(category)){
                                                  console.log("filter: "+filter+ " itemKey: "+itemKey);

                                                    overviewData[filterToKey[filter]][category]={}


                                        }

                                        if(!Object.keys(overviewData[filterToKey[filter]][category]).includes(itemKey)){
                                              overviewData[filterToKey[filter]][category][itemKey]=0;
                                        }


                                        if(isNaN(item)){
                                                item.split(',').forEach((item) => {
                                                          if(['yes','y','true','t'].includes(item)){
                                                              overviewData[filterToKey[filter]][category][itemKey]+=1;
                                                          }
                                                });
                                        }else{
                                          overviewData[filterToKey[filter]][category][itemKey]+=parseFloat(item);
                                        }
                                    }
                                  }
                                }
                              }
}


return overviewData;

}
