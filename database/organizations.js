/*

  The document focuses on database interactions
  pertaining to the organizations collection

*/


require('dotenv').config();

const uri=process.env.DATABASE_URI;

const MongoClient=require('mongodb').MongoClient;
const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology: true });

const ObjectID = require('mongodb').ObjectID;

const db_name=process.env.DATABASE_NAME;
const collection_name='organizations';

let organizationCollection;
(async function( ){

    await client.connect();
    organizationCollection=client.db(db_name).collection(collection_name);

})();


const userMainInterface=require('./users');


async function mainInterface(mode, paramsObj){

      try{
          if( mode=='createOrganization'){
              return createOrganization(paramsObj.organization)
          }else if (mode=='getOrganizationDetails') {
              return getOrganizationDetails(paramsObj.organization);
          }else if(mode=='removeFromOrganization'){
              return removeFromOrganization(paramsObj.organization);
          }


      }catch(err){
        console.log(err);
        return {sucess:false};
      }

}

module.exports=mainInterface;







/*


  Format of a given organization:
      {
        organization_name:String,
        owner_name: String,
        owner_email:String,
        spreadsheet_url:String, -- Given by user
        spreadsheet_id: String  -- Determined by program,
        connection_str: String -- Will be the object's id (_id.toHexString())
        users: [{
                  email: String
                  permission: String:
                                  Permission Options:
                                       All-Access - Save and Query Data, and manage Organization
                                      Limited-Access - Only Save Data,
                  }  , ... ]

    }
*/

//This function creates an organization
async function createOrganization(organizationObj){

      let errors=[];

      if(organizationObj.name.trim().length<3){
          errors.push('Organization name must be larger than 2 characters');
      }

      const spreadsheetIdRegex=/[-\w]{25,}/;
      if(!organizationObj.spreadsheet_url.test(spreadsheetIdRegex) || !organizationObj.spreadsheet_url.includes('spreadsheets') ){
          errors.push('Invalid spreadsheet url');
      }

      if(errors.length>0){
        return {success:false, errors:errors};
      }


      organizationObj.spreadsheet_id=spreadsheet_url.match(spreadsheetIdRegex)[0];
      console.log("organizationObj.spreadsheet_id: "+organizationObj.spreadsheet_id);
      organizationObj.users=[];

      const result=await organizationCollection.insertOne(organizationObj);

      // organization format:
      //     {
      //             connection_obj: obj,
      //             spreadsheet_id:string
      //   }


      return {
            sucess:true,
            organization:{
                connection_obj:result.insertedId,
                spreadsheet_id:organizationObj.spreadsheet_id
            }
          };

}


//Given a connection str, allows user to connect to organization
/*
    User Format:
        {
          email: String,
          permission: String
      }
*/
async function joinOrganization(user,connection_str){

    const connection_obj= ObjectID.createFromHexString(connection_str.trim());

    let organizationResult=await organizationCollection.updateOne(
        {
            _id:connection_obj
        },

        {
          $push:{
                  users:{
                    email:user.email,
                    permission:user.permission
                  }
                }
        }

    );

    if(organizationResult.matchedCount<1){
        return {success:false , errors: ['Organization does not exist']};
    }



    //Update user
    resultObj=userMainInterface('updateOrganization',
                  {
                    user:{
                            email:user.email,
                            permission:user.permission
                          },
                    connection_obj:connection_obj
                  }
            );

    if(resultObj.success){
        return {success:true};
    }else{
        return {success:true, errors:['Unexpected Error: Try Again']};
    }


}

/*
    organization format:{
          organization_id:string
  }
*/
async function getOrganizationDetails(organization){

      const organizationArr=await organization.find({_id:organization.organization_id}).toArray();

      if(organizationArr.length<1){
        return {success:false, errors:['Organization does not exist']}
      }

      return {success:true,details:organizationArr[0] };

}

/*
    organization format:{
    organization_id: string,
    userEmails:[string]
  }
*/
//Removes individuals from an organization
async function removeFromOrganization(organization){

      const organizationArr=await organizationCollection.find({_id:organization_id}).toArray();

      organization.userEmails=organization.userEmails.filter((email)=>{ email!=organizationArr[0].owner_email });

      const result=await organizationCollection.updateOne(
            {_id:organization.organization_id},
            {
              $pull:{
                 users:{
                    organization_id:{
                      $in:organization.userEmails
                    }
                 }
              }
            }

      );

      if(result.modifiedCount==organization.userEmails.length){

         return {success:true}
      }else{
        return {success:false,errors:['One or more individuals could not be deleted']}
      }

}
