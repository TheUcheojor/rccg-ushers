/*
This  module provides functions for  get and post requests.
*/





function getPage(page){

  // //console.log( "B4:" +window.location.href);
  window.location.href=page;

  // $.ajax({
  //   type : "GET",
  //   contentType : "String",
  //   url : `/${page}`,
  //   success :function(data){
  //             //console.log(`${page} pages has been opened`)
  //
  //    },
  //   error : function(e) {alert("Error!");}
  // });

}

//Updates the spreadsheet day if neccessary
function updateSpreadsheet(){
    $.ajax({
      type : "GET",
      contentType : "String",
      url : `/internals//updateSpreadsheet`,
      success :function(result){

                // if(!result.success){
                //   alert("errors: "+result.errors);
                // }

                let spreadsheet=result.spreadsheet;

                if(result.success && (spreadsheet!=null || spreadsheet!=undefined)  ){

                      //&& (spreadsheet.isOld==false)
                      Swal.fire(
                                'Loaded!',
                                `A new spreadsheet [ ${spreadsheet.title} ] has been loaded to Google Spreadsheet`,
                                'success'
                              );

                       // $.ajax({
                       //   type : "GET",
                       //   contentType : "String",
                       //   url : `/internals/setSpreadsheetOld`,
                       //   success :function(success){if(!success){//console.log("Error!")}  },
                       //   error : function(e) {alert("Error!");}
                       // });


                }



               saveOptionTransition();
               if(spreadsheet!=null && spreadsheet!=undefined){
                   //console.log("IN HERE");
                   $(".lastUpdated").fadeOut(1000, function(){
                       $(".lastUpdated").text( `Recent Update: ${capitalize(spreadsheet.month)} ${spreadsheet.day}, ${spreadsheet.year} (${spreadsheet.time})` ).fadeIn(1500);
                   });
               }else{
                 $(".lastUpdated").text("No Data").fadeIn(1500);
               }


       },
      error : function(e) {alert("Error!");}
    });




}


function getGraphDetails(filter){//Get data for various graphs

  $.ajax({
    type : "GET",
    contentType : "String",
    url : `/internals/getGraphDetails/${filter}`,
    success :function(result){

              //console.log("getGraphDetails result: "+JSON.stringify(result));

              if(!result.success){
                    showErrors('Graphing',result.errors);
                    $('.myGraph').fadeOut(()=>{
                        $('.graphNav').fadeOut(()=>{
                          $('.graph-no-data').show();
                        });

                    });
                    return;

              }
              let data=result.graphs;
              //console.log("data for graph: "+JSON.stringify(data));

              //console.log(" Object.keys(data.totalDonationsVsDate).length: "+ Object.keys(data.totalDonationsVsDate).length);

              if(data!=null && data!=undefined &&  Object.keys(data.totalDonationsVsDate).length!=0 ){

                    if($('.totalDonationsVsDate').css('display')=='none'
                            && $('.numOfMembersVsDate').css('display')=='none' &&
                          $('.methodOfPaymentVsDate').css('display')=='none'){

                            $('.totalDonationsVsDate').show();
                      }

                    $('.graphNav').show();
                    $('.graph-no-data').hide();

                    for([graphType,graphData] of Object.entries(data)){

                          generateGraphs('home',graphType,graphData,filter);
                    }

              }else{
                  $('.myGraph').fadeOut(()=>{
                      $('.graphNav').fadeOut(()=>{
                        $('.graph-no-data').show();
                      });

                  });





              }
     },
    error : function(e) {alert("Error!");}
  });

}

 function saveSpreadsheet(){//Saves spreadsheet to Database

       $(".save").hide();
       $(".loading-saveMessage").show();

       $(".spreadsheet-display").attr("onmouseenter","");
       $(".spreadsheet-display").attr("onmouseleave","");



   $.ajax({
           type : "GET",
           contentType : "String",
           url : `/internals/saveSpreadsheet`,
           success :async function(result) {

                  //resultArr
                  // var success=resultArr[0];
                  // var spreadsheet=resultArr[1];
                  //
                  //
                  // //console.log("requestsController: "+JSON.stringify(spreadsheet) )
                  //
                  // var message;
                  // if(spreadsheet==null ||spreadsheet==undefined ){message="Current Spreadsheet has been saved. (No Data)"}
                  // else{ message=`Spreadsheet [ ${spreadsheet.title} ] has been uploaded`}


                  if(result.success && result.spreadsheet!=null){
                      Swal.fire({icon:'success',title:'Saved!', text:`Spreadsheet [ ${result.spreadsheet.title} ] has been uploaded`});
                      //Swal.fire('Saved!',result.message,'success');
                  }else{
                      showErrors('Saving',result.errors);

                      //Swal.fire('Saved!',result.errors.join('\n'),'error');
                  }


                   ////console.log(spreadsheet);
                   // $(".save").attr("onclick","saveSpreadsheet('old');");
                   $(".save").show();
                   $(".loading-saveMessage").hide();

                  if(result.spreadsheet!=null && result.spreadsheet!=undefined){
                    $(".lastUpdated").hide(function(){
                        $(".lastUpdated").text( `Database Last Update: ${capitalize(result.spreadsheet.month)} ${result.spreadsheet.day}, ${result.spreadsheet.year} (${result.spreadsheet.time})` ).fadeIn();
                    });

                  }

                  $(".ss-Default").show();
                  $(".ss-onhover").hide();

                  $(".spreadsheet-display").attr("onmouseenter",'$(".ss-onhover").css("display","block");$(".ss-Default").css("display","none");');
                  $(".spreadsheet-display").attr("onmouseleave",'$(".ss-onhover").css("display","none");$(".ss-Default").css("display","block");');

                  await getGraphDetails('month');

           },
         error : function(e) {
           alert("Error!");
           //console.log("ERROR: ", e);
             }
             });


 }

 function showErrors(errorType,errors){

   let errorMsg='<div class="organization-form-group" ><ul>';

   errors.forEach((error)=>{
     errorMsg+=`<li> ${error}</li>`;
   })
   errorMsg+='<ul></div>';

   Swal.fire({icon:'error',title:errorType+' Error...', html:errorMsg });

 }


 // function getSavingMode(){//Saves spreadsheet to Database
 //
 //   $.ajax({
 //           type : "GET",
 //           contentType : "String",
 //           url : `/internals/getSavingMode`,
 //           success : function(resultArr) {
 //
 //                  var success=resultArr[0];
 //                  var spreadsheet=resultArr[1];
 //
 //                   if(success && (spreadsheet!=null || spreadsheet!=undefined) && (spreadsheet.isOld==false) ){
 //                         Swal.fire(
 //                                   'Loaded!',
 //                                   `A new spreadsheet [ ${spreadsheet.title} ] has been loaded to Google Spreadsheet`,
 //                                   'success'
 //                                 );
 //
 //                          $.ajax({
 //                            type : "GET",
 //                            contentType : "String",
 //                            url : `/internals/setSpreadsheetOld`,
 //                            success :function(success){if(!success){//console.log("Error!")}  },
 //                            error : function(e) {alert("Error!");}
 //                          });
 //
 //
 //                   }
 //
 //                  saveOptionTransition();
 //
 //                  if(spreadsheet!=null && spreadsheet!=undefined){
 //                      //console.log("IN HERE");
 //                      $(".lastUpdated").fadeOut(1000, function(){
 //                          $(".lastUpdated").text( `Recent Update: ${capitalize(spreadsheet.month)} ${spreadsheet.day}, ${spreadsheet.year} (${spreadsheet.time})` ).fadeIn(1500);
 //                      });
 //                  }else{
 //
 //                    $(".lastUpdated").text("No Data").fadeIn(1500);
 //                  }
 //
 //           },
 //         error : function(e) {
 //           alert("Error!");
 //           //console.log("ERROR: ", e);
 //             }
 //        });
 //
 //
 // }


 function getPreviewSpreadsheet(){//get the the current  content of spreadsheet
      $('.ss-loading-container').show();
      $(".outputScreen").html(`<h3>Preview Screen</h3>`).fadeIn();
      $('.spreadsheet-table').html("");


      $.ajax({
              type : "GET",
              contentType : "String",
              url : "/internals/previewSpreadsheet",
              success : function(result) {

                      //if(result==null || result==undefined || result==''){return null;}
                      //console.log("result: "+JSON.stringify(result));

                      $(".ss-loading-container").hide();

                      if(!result.success){
                          showErrors('Preview',result.errors);
                          return;

                      }


                      var title=result.spreadsheet.title;
                      var headerValues=result.spreadsheet.headerValues;
                      var contentRows=result.spreadsheet.contentRows;
                      //setting up the header

                      // $(".spreadsheet-content").css("border","3px solid  rgba(136, 135, 156,1)");



                      var htmlString="<tr>";
                      for(var i=0;i<headerValues.length;i++){//Add Header values
                          htmlString+=`<th> ${headerValues[i]} </th>`;
                      }
                      htmlString+="</tr>\n";


                      //console.log(contentRows);
                      for( var i=0; i<contentRows.length;i++){
                        ////console.log(contentRows[i]);
                         var row=contentRows[i];
                         var names=[row.FirstName,row.LastName];

                           htmlString+= "<tr>";
                         names.forEach(function(name){
                                      htmlString+=`<td> ${capitalize(name)} </td>`;
                         });

                          for([key,value] of Object.entries(row.item)){
                                htmlString+=`<td> ${value} </td>`;
                          }
                          htmlString+="</tr>\n";

                      }

                      $(".outputScreen").fadeOut( function(){
                            $(".outputScreen").html(`<h3>${title} [PREVIEW]</h3> `).fadeIn();
                            $(".spreadsheet-table").html(`${htmlString} </tr>`).fadeIn();
                      })


                  //console.log(result);

              },
            error : function(e) {
              alert("Error!");
              //console.log("ERROR: ", e);
                }
                });


 }
