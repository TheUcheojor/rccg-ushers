require('dotenv').config();


module.exports={
    service_account:{
      "private_key":  process.env.PRIVATE_KEY,
      "client_email": process.env.CLIENT_EMAIL,
    }

};
