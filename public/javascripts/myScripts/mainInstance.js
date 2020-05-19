
//Scripts to run when home page is opened

$(document).ready( async ()=>{
  await getSavingMode();
  await getPreviewSpreadsheet();
  await getGraphDetails('month');
});
