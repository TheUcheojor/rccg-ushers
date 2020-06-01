
const routes=require("express").Router();

const userMainInterface = require('../database/users')

// const User=require('../models/user');

routes.post('/create',async (req,res)=>{

    try{

      let user={
            email:req.session.user.email,
            name:req.session.user.name,
            organization_name:req.body.organization_name,
            spreadsheet_url:req.body.spreadsheet_url
      }

        console.log("req.body.organization_name: "+req.body.organization_name+ "spreadsheet_url: "+req.body.spreadsheet_url);

        let result=await userMainInterface('createOrganization',{user:user});
        //console.log("result from route org: "+JSON.stringify(result));
        if(result.success){
          console.log("createOrganization success ")
          req.session.user.organization=result.organization;
          res.redirect('/');

        }else{
          req.session.errors={createOrganization:result.errors}
          res.redirect('/organization');
        }



    }catch(err){
        console.log(err);
    }



})


module.exports=routes
