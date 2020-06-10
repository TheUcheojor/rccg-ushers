

const routes=require('express').Router();
const userMainInterface = require('../database/users');



routes.get('/',(req,res)=>{

  // console.log(" X req.session.name: "+req.session.user.name);
  // console.log(" X req.session.email: "+req.session.user.email);

  req.session.errors-{};
  res.render('main',{title: 'Dashboard',
                    // isMain:true,
                    user:req.session.user,
                      // isLimitedAcess:req.session.user.organization.permission=='Limited-Access',
                      // isAllAccess:req.session.user.organization.permission=='All-Access',
                      // isOwner:req.session.user.organization.permission=='Owner - All Access',

} );


});

routes.get('/organization',async (req,res)=>{

  // console.log(" X req.session.name: "+req.session.user.name);
  // console.log(" X req.session.email: "+req.session.user.email);

  let organization='';
  if(req.session.user.organization.organization_id){
     let organizationResult=await userMainInterface('getOrganizationDetails',{organization:req.session.user.organization});

     //console.log("\norganization: "+JSON.stringify(organization))
     if(!organizationResult.success){
       req.session.errors.fetchOrganizationDetails=organizationResult.errors;
     }else{
       organization=organizationResult.organization;
     }
  }

  let message=req.session.message;
  req.session.message={};

  let errors=req.session.errors;
  req.session.errors={};

  //console.log("MESSAGE: "+JSON.stringify(message));

  res.render('organization',{title: 'Organization',
                              // isOrganization:true,
                              user:req.session.user,
                              errors:errors,message:message,
                              // createOrganizationErrors:req.session.errors.createOrganization,
                              // joinOrganizationErrors:req.session.errors.joinOrganization,
                              // deleteOrRemoveOrganizationErrors:req.session.errors.deleteOrganization||req.session.errors.leaveOrganization,
                              // fetchOrganizationDetailsErrors:req.session.errors.fetchOrganizationDetails,
                              organization:organization,

                              // isLimitedAccess:req.session.user.organization.permission=='Limited-Access',
                              // isAllAccess:req.session.user.organization.permission=='All-Access',
                              // isOwner:req.session.user.organization.permission=='Owner - All Access',
                    });


});


routes.get('/settings',async (req,res)=>{

    let message=req.session.message;
    req.session.message={};

    let errors=req.session.errors;
    req.session.errors={};

    res.render('settings',{title:'Settings',errors:errors,message:message})

});


routes.get('/overview', (req,res)=>{

    res.render('overview',{title:'Overview',user:req.session.user,})

})

// routes.get('/search',(req,res)=>{
//   res.render('search',{title:'Search', isMain:false});
// });


module.exports=routes;
