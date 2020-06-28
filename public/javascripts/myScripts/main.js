
/*
    This file solely provides the dynamic features to the html page
*/


$(document).ready( ()=>{

    $('.dashboard-return').on('click', ()=>{
          $(".page.search").hide();
          $("#search-bar").val("");
          $(".hbs-body-container").fadeIn();
    });

    $('#search-bar').on('keyup', ()=>{
        $('.hbs-body-container').hide();
        $('.page.search').fadeIn();
        //console.log($('#search-bar').val())
        search( $('#search-bar').val());

    });

    $('.hor-nav-item.menu').on('click',()=>{
        // $('.hor-nav-bar').insertBefore('.side-bar');
        $('.side-bar').toggle();
    });

    $('.side-bar-nav').click(function(){
            window.location.href='/'+$(this).attr('page');
    });

    $('.hor-nav-item.logo').click( ()=>{
      window.location.href="/";
    })

    $('input[type=file]').change(function(e) {
        $(this).next().html($(this).val());
    });


})



function capitalize(str){//capitalize a given string
      if(str==null|| str.trim()==''|| str==undefined){ return ""}

      let capitalizedStr='';

      str.split(/(\s+)/).filter( function(substr){ return substr.trim().length>0}).forEach((substr)=>{

          capitalizedStr+=substr.charAt(0).toUpperCase() +substr.toLowerCase().slice(1)+' ';

      })

      return capitalizedStr;

}


function saveOptionTransition(){//Perfroms a simple transition of the .save div
    $(".save").fadeOut(function(){
        $(".loading-saveMessage").hide();
        $(".save").html("<h2>Save</h2>").fadeIn()
    });

}
