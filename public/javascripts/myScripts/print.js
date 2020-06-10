/*

This file focuses on downloading a pdf of  members' data

*/


async function  pdfDownload(mode,name){

   //window.scrollTo(0,0);

  var doc= new jsPDF();

  try{

        await $('.result-table.inner').each( (index,children)=>{

              doc.autoTable({ html: `#result-table-${index}`, theme:'grid' ,
                              styles: {
                                    lineColor: [44, 62, 80],
                                    lineWidth: 0.2,
                              },
                              headStyles:{halign:'left',fillColor:[136, 135, 156]},
                              bodyStyles:{halign:'center'}
                    });

          });


          await html2canvas(document.querySelector(`#searchGraph-container-0`)).then(  (canvas) =>{
                      doc.addPage();
                      var img=canvas.toDataURL("image/png");
                      doc.addImage(img, 'JPEG', 20,20,180,70);
          });

          await html2canvas(document.querySelector(`#searchGraph-container-1`)).then(  (canvas) =>{
                      var img=canvas.toDataURL("image/png");
                      doc.addImage(img, 'JPEG', 20,100,180,70);
          });

          if(mode=='date'){

            await html2canvas(document.querySelector(`#searchGraph-container-2`)).then(  (canvas) =>{
                        var img=canvas.toDataURL("image/png");
                        doc.addImage(img, 'JPEG', 20,180,180,70);
            });
          }

  }catch(error){
    //console.log(error)
  }
  finally{
      doc.save(`${name}_data.pdf`);
      $('.downloadData-button').html('Download PDF');

  }





//fullResults-container
//searchGraph-container,result-table



}
