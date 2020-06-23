
//Scripts to run when home page is opened

$(document).ready(()=>{


    (async ()=>{getPreviewSpreadsheet()} )();
   (async ()=>{getGraphDetails('month');} )();

    (async ()=>{updateSpreadsheet()} )();


    $('.open-spreadsheet').click(()=>{
        // console.log("$(this).attr('link'): "+$('.open-spreadsheet').attr('link'))
        window.open($('.open-spreadsheet').attr('link'));
    })

  

    $('.ss-option').on({
        mouseenter:function(){
          $(this).css('color','rgba(255, 255, 255,0.8)');
        },
        mouseleave:function(){
          $(this).css('color','rgba(255, 255, 255,1)');
        }
    });

    $('.ss-option.preview').click(()=>{getPreviewSpreadsheet();})
    $('.ss-option.save').click(()=>{saveSpreadsheet();})


    //onmouseenter='$(".ss-onhover").css("display","inline-block");$(".ss-Default").css("display","none");'  onmouseleave='$(".ss-onhover").css("display","none");$(".ss-Default").css("display","inline-block");'

  // updateSpreadsheet();

   //
   // (async ()=>{getSavingMode()} )();
   // getSavingMode();
   //
   // getPreviewSpreadsheet();
   //
   // getGraphDetails('month');
});
