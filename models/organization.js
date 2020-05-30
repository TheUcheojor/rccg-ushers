
const mongoose=require("mongoose");

const organizationSchema=mongoose.Schema({

      _id:mongoose.Schema.Types.ObjectId,
      email:{
          type: String,
          ref:'User'
         },
      owner:{ type:mongoose.Schema.Types.ObjectId, ref:'User'},
      users:[{ type:mongoose.Schema.Types.ObjectId, ref:'User'}]

});

module.exports=mongoose.model('Organization',organizationSchema,'organizations');
