

const routes=require('express').Router();



routes.get('/',(req,res)=>{
  res.render('main',{title: 'Main', isMain:true} );
});

routes.get('/search',(req,res)=>{
  res.render('search',{title:'Search', isMain:false});
});


module.exports=routes;
