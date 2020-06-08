
//Scripts to run when home page is opened

$(document).ready(()=>{


    (async ()=>{getPreviewSpreadsheet()} )();
   (async ()=>{getGraphDetails('month');} )();

    (async ()=>{updateSpreadsheet()} )();
  // updateSpreadsheet();

   //
   // (async ()=>{getSavingMode()} )();
   // getSavingMode();
   //
   // getPreviewSpreadsheet();
   //
   // getGraphDetails('month');
});
