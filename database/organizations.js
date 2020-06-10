/*

  The document focuses on database interactions
  pertaining to the organizations collection

*/


require('dotenv').config();

const uri=process.env.DATABASE_URI;

const MongoClient=require('mongodb').MongoClient;
const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology: true });

const ObjectID = require('mongodb').ObjectID;

const { GoogleSpreadsheet } = require('google-spreadsheet');
let clientPath=process.env.USER_CLIENT_SECRET_PATH;//IMPORTANT:Authorization

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
              return createOrganization(paramsObj.user,paramsObj.organization)
          }else if (mode=='getOrganizationDetails') {
              return getOrganizationDetails(paramsObj.organization);
          }else if(mode=='removeFromOrganization'){
              return removeFromOrganization(paramsObj.organization);
          }else if(mode=='addToOrganization'){
              return addToOrganization(paramsObj.user,paramsObj.organization);
          }else if(mode=='deleteOrganization'){
              return deleteOrganization(paramsObj.owner);
          }else if(mode=='removeFromOrganization'){
              return removeFromOrganization(paramsObj.organization);
          }else if(mode=='updateOrganizationPermissions'){
              return updateOrganizationPermissions(paramsObj.updateRequests,paramsObj.organization );
          }


      }catch(err){
        console.log(err);
        console.log('org main Interface error')
        return {sucess:false ,errors:['Organization Main Interface - Unexpected error']};
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
async function createOrganization(user,organizationObj){

      let errors=[];

      //potentialOwnerResultCheck is not needed as user will not have this option
      //when they are under an organization
      let potentialOwnerResultArray = await organizationCollection.find({owner_email:user.email}).toArray();

      console.log("potentialOwnerResultArray: "+potentialOwnerResultArray);
      if(potentialOwnerResultArray.length>0){
        return{success:false, errors:['You already belong to an organization']}
      }


      if(organizationObj.organization_name.trim().length<3){
          errors.push('Organization name must be larger than 2 characters');
      }

      const spreadsheetIdRegex=/[-\w]{25,}/;
      if( !spreadsheetIdRegex.test(organizationObj.spreadsheet_url) || !organizationObj.spreadsheet_url.includes('spreadsheets') ){
          errors.push('Invalid spreadsheet url');
      }

      if(errors.length>0){
        console.log('\n  1 error check in createOrg')
        return {success:false, errors:errors};
      }

      try{
          let defaultHeader=['FirstName',	'LastName',	'Cheque',	'Cash',	'Debit',	'Tithe'	,'Offerings',	'Thanksgiving',	'Mission',	'Building',	'Vow']



          let spreadsheetkey=organizationObj.spreadsheet_url.match(spreadsheetIdRegex)[0];


          let templateDoc=new GoogleSpreadsheet(process.env.TEMPLATE_SPREADSHEET_KEY);
          await templateDoc.useServiceAccountAuth(require(clientPath));
          await templateDoc.loadInfo();
          const templateSheet = templateDoc.sheetsByIndex[0];
          await templateSheet.copyToSpreadsheet(spreadsheetkey);//Copy template doc to new doc

          //Attempting to configure the spreadsheet
          let newdoc = new GoogleSpreadsheet(spreadsheetkey);//Access doc object
          await newdoc.useServiceAccountAuth(require(clientPath));
          await newdoc.loadInfo();
          await  newdoc.updateProperties({title: organizationObj.organization_name });
          await  newdoc.sheetsByIndex[0].delete();//Remove default spreadsheet
          //const newsheet=await newdoc.sheetsByIndex[0].updateProperties({ title: 'rccg ushers'});


      }catch(err){
          console.log(err)
          errors.push('Unable to access your spreadsheet. Please share your document with the email below (Editor Permissions)');

      }


      if(errors.length>0){
        console.log('\n  2 error check in createOrg')
        return {success:false, errors:errors};
      }


      organizationObj.spreadsheet_id=organizationObj.spreadsheet_url.match(spreadsheetIdRegex)[0];
      console.log("\norganizationObj.spreadsheet_id: "+organizationObj.spreadsheet_id);

      organizationObj.users=[];
      organizationObj.organization_name=organizationObj.organization_name.trim();




      const result=await organizationCollection.insertOne(organizationObj);

      console.log("MAKES IT HERE")
      // organization format:
      //     {
      //             connection_obj: obj,
      //             spreadsheet_id:string
      //   }


      return {
            success:true,
            organization:{
                name: organizationObj.organization_name,
                connection_obj:result.insertedId,
                organization_id:result.insertedId.toHexString(),
                spreadsheet_id:organizationObj.spreadsheet_id,
                permission:'Owner - All Access'
            }
          };

}


async function deleteOrganization(owner){

      if(owner==null){return{success:false,errors:['Empty Owner']}};

      let organizationArr=await organizationCollection.find({owner_email:owner.email}).toArray();

      console.log("organizationArr:  "+organizationArr);

      //console.log("WOAH");
      if(organizationArr.length<1){
          console.log("WOAH")
          return {success:false,errors:['Organization does not exist']}
      }

      let organization=organizationArr[0];

      let result= await organizationCollection.deleteOne({owner_email:owner.email});



      if (result.deletedCount>0){

            let users=[];
            console.log("\n\nowner.organization.organization_id: "+owner.organization.organization_id+'\n');
            try{
              await client.db(db_name).collection('organization_'+owner.organization.organization_id).drop();

            }catch{
              console.log("\nEmpty Collection!!!\n")
            }
            organization.users.forEach((user)=>{users.push(user.email)});

            return {success:true, users:users};

      }else{
          return {success:false, errors:'Unable to delete organization'}
      }



}






//Given a connection str, allows user to connect to organization
/*
    User Format:
        {
          email: String,
          permission: String
      }
*/
async function addToOrganization(user,organization){

    let  connection_obj;
    try{
      connection_obj= ObjectID.createFromHexString(organization.connection_str.trim());
    }catch(err){
      return{success:false, errors:['Organization does not exist']}
    }


    let organizationResult=await organizationCollection.updateOne(
        {
            _id:connection_obj
        },

        {
          $push:{
                  users:{
                    name:user.name,
                    email:user.email,
                    permission:user.permission
                  }
                }
        }

    );

    if(organizationResult.matchedCount<1){
        return {success:false , errors: ['Organization does not exist']};
    }else{

        let result_details= await organizationCollection.find({ _id:connection_obj}).toArray();
        let mainResult=result_details[0];

        console.log("mainResult._id.toHexString(): "+mainResult._id.toHexString());
        console.log("mainResult.organization_name: "+mainResult.organization_name);

        return {
                    success:true,
                    user:{
                      email:user.email,
                      permission:user.permission
                    },
                    organization:{
                        name:mainResult.organization_name,
                        connection_obj:connection_obj,
                        organization_id:mainResult._id.toHexString(),
                        spreadsheet_id:mainResult.spreadsheet_id,
                        permission:'Limited-Access'
                    }
              }
    }

    // name: organizationObj.organization_name,
    // connection_obj:result.insertedId,
    // organization_id:result.insertedId.toHexString(),
    // spreadsheet_id:organizationObj.spreadsheet_id


    //Update user
    // resultObj=userMainInterface('updateOrganization',
    //               {
    //                 user:{
    //                         email:user.email,
    //                         permission:user.permission
    //                       },
    //                 connection_obj:connection_obj
    //               }
    //         );
    //
    // if(resultObj.success){
    //     return {success:true};
    // }else{
    //     return {success:true, errors:['Unexpected Error: Try Again']};
    // }


}

/*
    organization format:{
          connection_obj:obj
  }
*/
async function getOrganizationDetails(organization){

      if(organization==null){return {success:false,errors:['Null Organization']}}

      const organizationArr=await organizationCollection.find({_id:organization.organization_id}).toArray();

      if(organizationArr.length<1){
        return {success:false, errors:['Organization does not exist']}
      }


      return {success:true,
          organization:{
                owner_name:organizationArr[0].owner_name,
                owner_email:organizationArr[0].owner_email,
                users:organizationArr[0].users,
          }

          };

}

/*
    organization format:{
    organization_id: string,
    userEmails:[string]
  }
*/
//Removes individuals from an organization
async function removeFromOrganization(organization){

      console.log("\n\nremoveFromOrganization  organization"+JSON.stringify(organization)+'\n\n');

      let organizationArr=await organizationCollection.find({_id:organization.organization_id}).toArray();
      //console.log("type organization.organization_id: "+typeof organization.organization_id)
      organization.userEmails=organization.userEmails.filter((email)=>{ return email!=organizationArr[0].owner_email });


      console.log("\n\n"+  organization.userEmails+"\n\n")

      let result=await organizationCollection.updateOne(
            {_id:organization.organization_id},
            {
              $pull:{
                 users:{
                    email:{
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


async function updateOrganizationPermissions(updateRequests,organization){

        let result;

        for(var [email,permission] of Object.entries(updateRequests) ){
                try{
                    console.log("\n\n\n messagekey=1 EMAIL: "+email+"\nPERMISSION: "+permission );
                    console.log("organization: "+JSON.stringify(organization));
                     result= await organizationCollection.updateOne({_id:organization.organization_id},
                          {$set: {'users.$[elem].permission':permission }},
                          { arrayFilters:[ {"elem.email":{$eq:email}} ]}
                    );

                    console.log("\nresult.matchedCount:"+result.matchedCount);
                    if(result.matchedCount<1){
                        return {success:false, errors:['Unable to update user with email '+email]}
                    }

                }catch(err){
                  console.log(err);
                  return {success:false, error:['Database Error']}
                }

        }



  return {success:true}



}
