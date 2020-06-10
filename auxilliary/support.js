

module.exports={

      capitalize: (str)=>{
          if(str==null|| str.trim()==''|| str==undefined){ return ""}

          let capitalizedStr='';

          str.split(/(\s+)/).filter( function(substr){ return substr.trim().length>0}).forEach((substr)=>{

              capitalizedStr+=substr.charAt(0).toUpperCase() +substr.toLowerCase().slice(1)+' ';

          })

          return capitalizedStr;
      },




};
