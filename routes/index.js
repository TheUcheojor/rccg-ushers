

const routes=require('express').Router();



routes.get('/',(req,res)=>{

  console.log(" X req.session.name: "+req.session.user.name);
  console.log(" X req.session.email: "+req.session.user.email);

  res.render('main',{title: 'Dashboard', name:req.session.user.name} );

  
});


// routes.get('/search',(req,res)=>{
//   res.render('search',{title:'Search', isMain:false});
// });


module.exports=routes;
