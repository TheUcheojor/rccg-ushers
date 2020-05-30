
const mainInterface=require('../database/users');


module.exports={
    checkLoggedIn:function (req,res,next){

        if(req.session.email){
            console.log(req.session.email);
            //console.log('In here 2');
            next();
        }else{
          console.log('In here');
          res.render('login', {title: 'Login',layout:'landingLayout'});
        }

    },

    login: async function (req,res,next){

        let loginResultObj={success:false, errors:[]};
        let user;

        //console.log(req.body.email, req.body.password);

        if(req.body.email && req.body.password){
          console.log("In Login")
             user= {
                email:req.body.email,
                password:req.body.password
              }

            loginResultObj=await mainInterface('login', {user:user});
        }

        if(loginResultObj.success){
              console.log("IN LOGIN SUCESS");

              req.session.email=user.email;
              req.session.name=loginResultObj.name;
              console.log(req.session.email,req.session.name);

              res.redirect('/');
        }else{

              console.log(loginResultObj);
              res.render('login',
                  { title:'login',
                    errors:loginResultObj.errors,
                    layout:'landingLayout',
                    name:req.body.name,
                    email:req.body.email,
                    password:req.body.password
                   }
               );
        }

    },

    logout: function (req,res,next){
          req.session.email=undefined;
          req.session.name=undefined;
          res.redirect('/');
        //  res.render('login', {title:'login'});
    },

    signUp:async function(req,res,next){

          let signUpResultObj={success:false, errors:[]};
          let user;
          console.log(req.body.name,req.body.email)
          if(req.body.name && req.body.email && req.body.password){

            console.log("HELLO");
             user={
                name:req.body.name,
                email:req.body.email,
                password:req.body.password,
                confirm_password:req.body.confirm_password,
              };

            console.log(user);
            signUpResultObj=await mainInterface('signUp', {user:user});

          }


          if(signUpResultObj.success){
            console.log("Sign up 1");
              console.log(user)
              req.session.email=user.email;
              req.session.name=user.name;
              res.redirect('/');
          }else{
              res.render('signUp',
                  {title:'Sign Up',
                  errors:signUpResultObj.errors,
                  layout:'landingLayout',
                  name:req.body.name,
                  email:req.body.email,
                  password:req.body.password

                })
          }
    }









}
