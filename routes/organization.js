
const routes=require("express").Router();

const userMainInterface = require('../database/users');

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
        alert("Fatal ERROR!")
        res.redirect('/logout');
    }



});


routes.post('/join',async (req,res)=>{

      try{

          if(!req.session.user.organization.organization_id){

                let user={name:req.session.user.name,email:req.session.user.email, permission:'Limited-Access'};
                let organization={connection_str:req.body.connection_str};

                let result = await userMainInterface('joinOrganization',{user:user,organization:organization});

                console.log("Join Results: "+JSON.stringify(result));

                if(result.success){
                    req.session.user.organization=result.organization;
                    req.session.errors={};
                    res.redirect('/');
                }else{

                    req.session.errors={joinOrganization:result.errors};
                    res.redirect('/organization');
                }
          }else{
              req.session.errors={joinOrganization:['You belong to an organization']};
              res.redirect('/organization');

          }



      }catch(err){
        console.log(err)
        alert("Fatal ERROR!")
        res.redirect('/logout');
      }

});

routes.post('/delete',async (req,res)=>{
    try{
        let result=await userMainInterface('deleteOrganization',{owner:req.session.user});


        if(result.success){
          res.redirect('/');
        }else{
          req.session.errors={deleteOrganization:result.errors};
          res.redirect('/organization')
        }

    }catch(err){
        console.log(err);
        alert("Fatal ERROR!")
        res.redirect('/logout');
    }
});


routes.post('/leave', async (req,res)=>{
    try{
      let result=await userMainInterface('leaveOrganization',{user:req.session.user});

      if(result.success){
          req.errors={};
          res.redirect('/');

      }else{

        req.session.errors={leaveOrganization:result.errors};
        res.redirect('/organization');
      }

    }catch(err){
      console.log(err);
      alert("Fatal ERROR!")
      res.redirect('/logout');
    }


});


routes.post('/updatePermissions', async (req,res)=>{

      console.log("\n\n updatePermissions"+JSON.stringify(req.body))
      try{
            const result=await userMainInterface('updateOrganizationPermissions',{updateRequests:req.body, organization:req.session.user.organization})

            console.log("\n\nupdatePermissions RESULT: "+JSON.stringify(result)+'\n');

            if(result.success){
                req.session.errors={};
                req.session.message={updatePermissions:['Updates have been saved']}
            }else{
                req.session.errors={updatePermissions:result.errors};
            }

            res.redirect('/organization');

      }catch(err){
        console.log(err);
        console.log(err);
        alert("Fatal ERROR!")
        res.redirect('/logout');

      }

})

module.exports=routes
