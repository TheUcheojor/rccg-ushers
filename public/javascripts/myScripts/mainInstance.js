
//Scripts to run when home page is opened

$(document).ready(()=>{


    (async ()=>{getPreviewSpreadsheet()} )();
   (async ()=>{getGraphDetails('month');} )();

    (async ()=>{updateSpreadsheet()} )();


    $('.open-spreadsheet').click(()=>{
        // console.log("$(this).attr('link'): "+$('.open-spreadsheet').attr('link'))
        window.open($('.open-spreadsheet').attr('link'));
    })
  // updateSpreadsheet();

   //
   // (async ()=>{getSavingMode()} )();
   // getSavingMode();
   //
   // getPreviewSpreadsheet();
   //
   // getGraphDetails('month');
});
