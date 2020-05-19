/*

  JS Documents focues on search features

*/

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
    if(searchStr.trim().length==0){return;}


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
        if(redFlag){return;}

        if(searchArr.length==2){ mode='yearMonth';}
        else if(searchArr.length==3){ mode='yearMonthDay';}
        else{ return;}

        searchStr=searchArr.join('/');


    }else if(!isNaN(searchStr)){//Search Option : YEAR
        mode='year';
        if(searchStr.length!=4){return;}

        console.log('YEAR redFlag: '+redFlag);

    }else{//Search Option: NAME

        searchStr.split('').forEach( (char)=> {
                if(!isNaN(char)){
                    redFlag=true;
                }
        });

        console.log('name redFlag: '+redFlag);
        if(redFlag){return}
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

              if(data.length==0){
                  $('.result-table').html('');
                  return;
                }
              console.log("data: "+JSON.stringify(data));

              if(mode='name'){

                    var htmlString=`
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
                                            <td class='result-preview-button' onclick='openNameResultPreview(${JSON.stringify(item)})'>Prevew Details</td>
                                      </tr>`;

                    });

                    $('.result-table').html(htmlString);

              }
       },
      error : function(e) {alert("Error!");}
    });
}


function openNameResultPreview(memberItem){

  $('.result-preview-container').show();

  $(`#year-filter`).click( ()=>{
  //  console.log("2 -filterOptionToMode[filterOptions[i]]: "+filterMode);
    $.ajax({
            url: '/internals/getMemberGraph',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({member:[memberItem], filter:'year' } ),
            dataType: 'json',
            success: function(memberGraph){
                  console.log("memberGraph: "+JSON.stringify(memberGraph));
                  filterNameResult(memberItem,'year',memberGraph);
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
            data: JSON.stringify({member:[memberItem], filter:'month' } ),
            dataType: 'json',
            success: function(memberGraph){
                  console.log("memberGraph: "+JSON.stringify(memberGraph));
                  filterNameResult(memberItem,'month',memberGraph);
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
            data: JSON.stringify({member:[memberItem], filter:'day' } ),
            dataType: 'json',
            success: function(memberGraph){
                  console.log("memberGraph: "+JSON.stringify(memberGraph));
                  filterNameResult(memberItem,'day',memberGraph);
            },
           error : function(e) {alert("Error!");}
        });
  } );

}


function filterNameResult(data,filter, graphs){

        //console.log("String data:"+data);

        //console.log("IN FILTER_NAME_RES graphs:"+JSON.stringify(graphs));
        $('.filterBy').fadeOut();

        // $('.result-preview-container').html('');


        // data=JSON.parse(data);
        var overviewData={'FirstName': data['FirstName'],'LastName': data['LastName']};

        for([yearKey,yearObj] of Object.entries(data) ){

                      if(!['FirstName', 'LastName', 'FullName','_id'].includes(yearKey)){

                              if (filter=='year') {overviewData[yearKey]={}; }

                              for([monthKey,monthObj] of Object.entries(yearObj)){

                                    if (filter=='month') {overviewData[`${yearKey}/${monthKey}`]={}; }

                                    for([dayKey,dayObj] of Object.entries(monthObj)){

                                        if (filter=='day') {overviewData[`${yearKey}/${monthKey}/${dayKey}`]={};}

                                        for([itemKey,item] of Object.entries(dayObj)){

                                            var filterToKey={'year':yearKey ,'month':`${yearKey}/${monthKey}`,'day':`${yearKey}/${monthKey}/${dayKey}` };

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



    console.log(overviewData);

    var htmlString=`
                  <div style="background-color:#E8E8E8">
                  <table class="result-table">
                          <tr>
                              <th style="border-radius:10px;text-align:center;"><h2>${capitalize(overviewData['FirstName'])} ${capitalize(overviewData['LastName'])}</h2></th>
                          </tr>
                  </table>
                  <br />

                  <div class="searchGraph-container">
                        <canvas class=" searchGraph searchCanvasTotalDonationsVsDate">
                        </canvas>
                  </div>
                    <div class="searchGraph-container">
                          <canvas class="searchGraph searchCanvasMethodOfPaymentVsDate">
                          </canvas>
                    </div>



                  `;


    for([categoryKey,categoryObj] of Object.entries(overviewData)){//Disolay user data filtered by year,month or day
          if(!['FirstName','LastName'].includes(categoryKey)){
                htmlString+=`
                            <table class="result-table">
                                <tr>
                                      <th style="border-radius:10px;text-align:center;"> ${categoryKey} </th>
                                </tr>

                            </table>
                          `;

             for([subCatKey,subCatObj] of Object.entries(categoryObj)){
                    htmlString+=`<table class="result-table">
                                      <tr>
                                        <th>${subCatKey}</th>
                                      </tr>
                                </table>
                                <table class="result-table">

                                `;


                  for([key,val] of Object.entries(subCatObj)){
                    htmlString+=`
                                <tr>
                                    <td>${key}</td>
                                    <td>${val}</td>
                                </tr>`;

                  }

                  htmlString+=`</table>`;


             }

            htmlString+=`<br/><br/>`;

          }



    }

    htmlString+="</div>";
    $('.result-preview-content').html(htmlString);


    for([graphType,graphData] of Object.entries(graphs)){
              if(graphType!="numOfMembersVsDate"){
                    generateGraphs('search',graphType,graphData,filter);
              }

      }


}
