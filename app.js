
require('dotenv').config();

const express = require("express");
const favicon = require('serve-favicon');
const path=require("path");
const hbs=require("express-handlebars");
const bodyParser=require('body-parser');
const session=require('express-session');
const cookieParser=require('cookie-parser')

//const {checkLoggedIn, login,logout,signUp }=require('./auth/auth')
const auth=require('./auth/auth');


const indexRouter=require("./routes/index");
const spreadsheetRouter=require("./routes/spreadsheet");
const organizationRouter=require("./routes/organization");

const {cron, cron_checker}=require("./tasks/scheduledTasks");

const PORT=process.env.PORT||4000;

let app = express();





app.engine('hbs', hbs({extname:'hbs',defaultLayout:'mainLayout', layoutsDir: __dirname+'/views/layout'  }));
app.set('views', path.join(__dirname,'views'));
app.set('view engine','hbs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'public')));

// set up the session
app.use(
  session({
    secret: "app",
    name: "app",
    resave: true,
    saveUninitialized: true
    // cookie: { maxAge: 6000 } /* 6000 ms? 6 seconds  */
  })
);


app.use('/internals',auth.checkLoggedIn,spreadsheetRouter);
app.use('/organization',auth.checkLoggedIn,organizationRouter );
app.use('/login',auth.login,indexRouter);
app.use('/sign-up',auth.signUp,indexRouter);
app.use('/',auth.checkLoggedIn, indexRouter);

app.use(favicon(path.join(__dirname,'public','favicon.ico')));








// var path = __dirname + '/public/views/';


// app.use('/internal',routes);
//
// app.get('/', (req,res)=>{
//     res.sendFile(path+"main.html");
// });
//
// app.get('/:page', (req,res)=>{
//
//     console.log(req.params.page);
//     res.sendFile(path+req.params.page+".html");
//
// });



app.listen(PORT, () => {
  console.log('App listening on port '+PORT);
});
