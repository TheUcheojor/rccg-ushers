

const routes=require('express').Router();
const userMainInterface = require('../database/users');



routes.get('/',(req,res)=>{

  console.log(" X req.session.name: "+req.session.user.name);
  console.log(" X req.session.email: "+req.session.user.email);

  req.session.errors-{};
  res.render('main',{title: 'Dashboard', isMain:true, user:req.session.user,
                      isLimitedAcess:req.session.user.organization.permission=='Limited-Access',
                      isAllAccess:req.session.user.organization.permission=='All-Access',
                      isOwner:req.session.user.organization.permission=='Owner - All Access',

} );


});

routes.get('/organization',async (req,res)=>{

  console.log(" X req.session.name: "+req.session.user.name);
  console.log(" X req.session.email: "+req.session.user.email);

  let organization='';
  if(req.session.user.organization.organization_id){
     organization=await userMainInterface('getOrganizationDetails',req.session.user.organization);
  }

  res.render('organization',{title: 'Dashboard',isOrganization:true,  user:req.session.user,
                              createOrganizationErrors:req.session.errors.createOrganization,
                              joinOrganizationErrors:req.session.errors.joinOrganization,
                              deleteOrRemoveOrganizationErrors:req.session.errors.deleteOrganization||req.session.errors.leaveOrganization,
                              isLimitedAccess:req.session.user.organization.permission=='Limited-Access',
                              isAllAccess:req.session.user.organization.permission=='All-Access',
                              isOwner:req.session.user.organization.permission=='Owner - All Access',
                    });


});

// routes.get('/search',(req,res)=>{
//   res.render('search',{title:'Search', isMain:false});
// });


module.exports=routes;
