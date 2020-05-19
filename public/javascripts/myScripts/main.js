
/*
    This file solely provides the dynamic features to the html page
*/




function capitalize(str){//capitalize a given string
      if(str==null|| str==''|| str==undefined){ return ""}
      return str.charAt(0).toUpperCase() +str.toLowerCase().slice(1);
  }


function saveOptionTransition(){//Perfroms a simple transition of the .save div
    $(".save").fadeOut(function(){
        $(".loading-saveMessage").hide();
        $(".save").html("<h2>Save</h2>").fadeIn()
    });


  }

  // function getPage(page){
  //       $('.page').fadeOut(300,()=>{
  //
  //             $('.'+page).fadeIn();
  //
  //       })
  //
  // }





function highlightButton(ButtonClass){

  //Chaniging Selected Button - Start
  var varButtons=['main-page','about-us','vert-menu-sel'];
  for(var i=0;i<varButtons.length;i++){
    var parent=document.getElementsByClassName("hor-bar-item "+varButtons[i])[0];

    if(varButtons[i]=="vert-menu-sel"){
      parent.children[0].style="position:absolute;float:left;top:0;padding:10px;width:30px;height:30px;";
      //parent.setAttribute('name','menu OFF');
    }else{
      parent.style.color="rgba(255,255,255,1)";
    }


  }


  //set opacity of main body to full
  document.getElementsByClassName('mainContent')[0].style.opacity='100%';

  var vertParent=document.getElementsByClassName('vert-bar')[0];
  var horParent=document.getElementsByClassName("hor-bar-item vert-menu-sel")[0];



  if(ButtonClass=="vert-menu-sel" ){


    var menuState=parent.getAttribute('name');

    console.log(menuState);

    if(menuState== 'menu OFF' ){

      horParent.children[0].style.filter="invert(60%)";
      horParent.setAttribute('name','menu ON');

      vertParent.style.animationName='slide-right';
      vertParent.style.left="0px";
      document.getElementsByClassName('mainContent')[0].style.opacity='40%';

    }else{

    horParent.children[0].style.filter="none";
    horParent.children[0].style="position:absolute;float:left;top:0;padding:10px;width:30px;height:30px;";
    horParent.setAttribute('name','menu OFF');

    vertParent.style.animationName='slide-left';
    vertParent.style.left="-300px";

    document.getElementsByClassName('mainContent')[0].style.opacity='100%';
    }

 }else{
    document.getElementsByClassName("hor-bar-item "+ButtonClass)[0].style.color="rgba(255,255,255,0.5)";

    if(vertParent.style.animationName!=''){
      horParent.setAttribute('name','menu OFF');
      vertParent.style.animationName='slide-left';
      vertParent.style.left="-300px";

    }

  }

}
