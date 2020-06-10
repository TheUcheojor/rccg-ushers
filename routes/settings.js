const routes=require("express").Router();

const userMainInterface = require('../database/users');


routes.post('/changePassword',async (req,res)=>{

    try{
        let result=await userMainInterface('changePassword',{user:req.session.user,passwords:req.body})

        if(result.success){
            req.session.errors-{};
            req.session.message={'changePassword':['Your password has been updated']}

        }else{
            req.session.errors={'changePassword':result.errors};
        }

        res.redirect('/settings');

    }catch(err){
      //console.log(err);
      //console.log(err);
      alert("Fatal ERROR!")
      res.redirect('/logout');
    }
      //changePassword(paramsObj.user,paramsObj.passwords)

});



module.exports=routes;
