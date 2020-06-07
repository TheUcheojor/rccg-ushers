
//Scripts to run when home page is opened

$(document).ready( async()=>{

   (async ()=>{updateSpreadsheet()} )();

   (async ()=>{getSavingMode()} )();

   (async ()=>{getPreviewSpreadsheet()} )();

   (async ()=>{getGraphDetails('month');} )();
   // getSavingMode();
   //
   // getPreviewSpreadsheet();
   //
   // getGraphDetails('month');
});
