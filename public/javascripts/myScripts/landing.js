$(document).ready(()=>{

    $('.submit-button.reset-password').click(()=>{

        if($('#email').val()!=''){

          $('.form-group.button-container').append('<img  src="/Images/loading.gif" />');
          $('.submit-button.reset-password').hide();


        }

    })


});
