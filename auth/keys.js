require('dotenv').config();


module.exports={
    service_account:{
      "private_key":  process.env.PRIVATE_KEY.replace(/\\n/gm, '\n'),
      "client_email": process.env.CLIENT_EMAIL,
    }

};
