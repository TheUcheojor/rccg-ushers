

const routes=require('express').Router();



routes.get('/',(req,res)=>{

  console.log(" X req.session.name: "+req.session.name);
  console.log(" X req.session.email: "+req.session.email);

  res.render('main',{title: 'Dashboard', name:req.session.name} );
});

routes.get('/search',(req,res)=>{
  res.render('search',{title:'Search', isMain:false});
});


module.exports=routes;
