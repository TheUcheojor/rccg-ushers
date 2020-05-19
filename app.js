
const express = require("express");
const routes=require("./routes");

const {cron, cron_checker}=require("./tasks/scheduledTasks");

let app = express();
// let router = express.Router();
let bodyParser = require('body-parser');


app.use(bodyParser.json());
app.use(express.static('public'));


app.use('/internals',routes);

let PORT=process.env.PORT||3000;
var path = __dirname + '/public/views/';


app.use('/internal',routes);

app.get('/', (req,res)=>{
    res.sendFile(path+"main.html");
});

app.get('/:page', (req,res)=>{

    console.log(req.params.page);
    res.sendFile(path+req.params.page+".html");

});



app.listen(PORT, () => {
  console.log('App listening on port '+PORT);
});
