/*

This document will fouces on signing in;up users,
storing their details in the datebase

*/

//const MongoClient = require('mongodb').MongoClient;

require('dotenv').config();
const bcrypt=require('bcrypt');

const uri=process.env.DATABASE_URI;

const MongoClient=require('mongodb').MongoClient;
const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology: true });

const db_name=process.env.DATABASE_NAME;
const collection_name='users';

let users_collection;
(async function( ){

    await client.connect();
    users_collection=client.db(db_name).collection(collection_name);
})();

const organizationMainInterface=require('./organizations');


async function mainInterface(mode,paramsObj){

  try{

        if(mode=='signUp'){
                return await signUp(paramsObj.user);
        }else if(mode=='login'){
                return await login(paramsObj.user);
        }else if(mode=='updateOrganization'){
                return await updateOrganization(paramsObj.user,paramsObj.organization)
        }else if(mode=='createOrganization'){
                return await createOrganization(paramsObj.user);
        }else if(mode=='joinOrganization'){
                return await joinOrganization(paramsObj.user,paramsObj.organization);
        }else if(mode=='deleteOrganization'){
                console.log("main Interface paramsObj.owner:"+JSON.stringify(paramsObj.owner));
                return await deleteOrganization(paramsObj.owner);
        }else if(mode=='getUser'){
                return await getUser(paramsObj.user);
        }else if(mode=='leaveOrganization'){
                return await leaveOrganization(paramsObj.user);
        }else if(mode=='getOrganizationDetails'){
                return await getOrganizationDetails(paramsObj.organization);
        }else if(mode=='updateOrganizationPermissions'){
                return await  updateOrganizationPermissions(paramsObj.updateRequests, paramsObj.organization);
                //updateOrganizationPermissions(params.updateRequests,paramsObj.organization);
        }



  }catch(err){
    console.log(err);
    return {success:false, errors:['User Main Interface- Unexpected  Error']}
  }

}

module.exports=mainInterface;



/*
    MAIN SECTION : Interface Functions Setion
*/

/*
      Subsection - Users' Interactions with their account
*/

async function getUser(user){

    //console.log("IN FUNCTION")
    let searchedUser;
    try{

        console.log("IN TRY getUser user.email: "+user.email);
       searchedUser=(await users_collection.find({email:user.email}).project({_id:0, name:1,email:1,organization:1 }).toArray())[0];
       console.log("IN TRY searchedUser:  "+JSON.stringify(searchedUser));
    }catch(err){
      console.log(err);
      //console.log('getuser error caught')
      return{success:false,errors:['User could not be found']};
    }

  //  console.log('In here success true')
  console.log("getUser searchedUser: "+JSON.stringify(searchedUser));

    return {success:true,user:searchedUser};


}


//The login function checks if user exists
// userObj Structure:
//         {
//           email: unique
//           password: [will be encrypted]
//          }



async function login(userObj){


    errors=[];
    userArray=[];
    try{
      userArray=await users_collection.find({email:userObj.email }).toArray();
    }catch(err){
      //errors.push('Database error!');
      console.log(err);
    }

    if( userArray.length==0){
      errors.push('User does not exist');
    }

    if(errors.length>0){
        return {success:false, errors:errors };
    }


    const user=userArray[0];

    let isValidPassword=false;

     await bcrypt.compare(userObj.password,user.password)
     .then( (res)=>{

          if(res==true){
            console.log("Valid Pass")
            isValidPassword=true;
          }else{
            console.log("InValid Pass")
            errors.push('Invalid Password!');
          }

    })
    .catch(err=>{console.log(err)});

    console.log("isValidPassword: "+isValidPassword)
    if(isValidPassword){

        // let organization_id
        // if(user.organization.organization_id!==''){
        //     organization_id=user.organization;
        // }else{
        //     organization_id='';
        // }
        //  console.log(user);
        // console.log("user.organization.name: "+user.organization.name);

        return {
                  success:true,
                  name: user.name,
                  email:user.email,
                  organization:{
                    name:user.organization.name,
                    spreadsheet_id:user.organization.spreadsheet_id ,
                    organization_id:user.organization.organization_id,
                    permission:user.organization.permission,
                  }
                };
    }else{
        return {success:false, errors:errors };
    }

}




/*
    Creates a user, storing details in database.
    // userObj Structure:
    //         {
    //           name: string
    //           email: unique
    //           password: [will be encrypted]
    //           confirm_password: password
    //           organization: reference
    //          }
*/
async function signUp(userObj){

    let errors=[];

    if(userObj.name.trim().length<3){
        errors.push('Name must be greater than 2 characters' );
    }

    if (!isValidEmail(userObj.email.trim())){
      errors.push('Email is not valid!' );
    }else{
      userObj.email=userObj.email.trim();
    }

    if(await doesUserExist(userObj.email)){
      errors.push('Existing email!');
    }

    if(userObj.confirm_password!=userObj.password){
      errors.push('Passwords do not match!');
    }

    let passwordObj=isValidPassword(userObj.password);
    if( !passwordObj.isValidPassword){
         passwordObj.errors.forEach((error)=>{
              errors.push(error);
         } );
    }

    if(Object.keys(errors).length>0){
        return {loginSuccess:false , errors:errors };
    }

    delete userObj.confirm_password;

    let success=true;
    let saltRounds=10;

    await bcrypt.genSalt(saltRounds)
    .then( async (salt)=>{

          await bcrypt.hash(userObj.password, salt)
          .then(async (hash)=>{
            userObj.password=hash;
            userObj.organization={
                  name:'',
                  spreadsheet_id:'' ,
                  organization_id:'',
                  permission:'',
            };
            userObj.name=userObj.name.trim();
            userObj.email=userObj.email.trim();

            await users_collection.insertOne(userObj);

          }).catch((err)=>{
            console.log(err);
            success=false;
            errors.push('Password hashing error');
          });

    }).catch((err)=>{
        console.log(err);
        success=false;
        errors.push('Password hashing error');
      });




    if(success){
      return {
                success:true ,
                name: userObj.name,
                email:userObj.email,
                organization:{
                  name:'',
                  spreadsheet_id:'' ,
                  organization_id:'',
                  permission:'',
                }
              };
    }else{
      return {success:false , errors:errors };
    }
}

//add org and user coll

/*
      user Format
      {
            email: string,
            permission: string
        }

*/





/*
      NEW SECTION - Users' Interactions with their organizations
*/


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


/*user format: {
          email: string,
          name:string,
          organization_name:string
          spreadsheet_url:string
        }

*/
async function createOrganization(user){

      let organization={
                        owner_name:user.name,
                        owner_email:user.email,
                        organization_name:user.organization_name,
                        spreadsheet_url:user.spreadsheet_url

     };

     console.log('organization: '+JSON.stringify(organization));
      const result_org=await organizationMainInterface('createOrganization',{user:user,organization:organization} );


      if(result_org.success ){
        user.permission='Owner - All Access';
        let result_user =await updateOrganization(user,result_org.organization);

        if(result_user.success){
          return {success:true, organization:result_org.organization }

        }else{
          return {success:false,errors:result_user.errors}
        }

      }else{
        console.log("user createOrganization not successfull")
        return {success:false, errors:result_org.errors};
      }

}

// User format: {email: String}
async function deleteOrganization(owner){

    console.log("\n\ndeleteOrganization owner: "+JSON.stringify(owner)+"\n\n" );

    let result_org=await organizationMainInterface('deleteOrganization',{owner:owner})


    if(result_org.success){

            let organization={name:'',spreadsheet_id:'' ,organization_id:'',permission:''};

            result_org.users.push(owner.email);
            console.log("\nresult_org: "+result_org+'\n');

            let result_user = await users_collection.updateMany(
                      {email:{$in:result_org.users} },
                      {$set:{
                                organization:organization
                            }
                      }
          );

          return {success:true};

    }else{

      return {success:false, errors:result_org.errors}

    }



}


/*
      organization format:
          {
                  organization_id: obj,
                  spreadsheet_id:string
        }

*/

async function updateOrganization(user,organization){

      const result= await users_collection.updateOne(
            {
              email:user.email
            },
            {
              $set:{
                organization:
                    {
                        name:organization.name,
                        organization_id:organization.connection_obj,
                        spreadsheet_id:organization.spreadsheet_id,
                        permission:user.permission

                    }
              }
            }
     );

     if( result.matchedCount<1){
       return {success: false, errors:['Unexpected Errors']}
     }

     return {success: true }

}


/*
  user:{name:str, email:str, permission:str }
  organization:{connection_str: str}
*/
async function joinOrganization(user,organization){


    let result_org =await organizationMainInterface('addToOrganization',{user:user,organization:organization });

    if(result_org.success){
          let result_user= await updateOrganization(user,result_org.organization);

          if(result_user.success){
            return {success:true,organization:result_org.organization}
          }else{
            return {success:false,errors:result_user.errors}
          }

    }else{
      return {success:false,errors:result_org.errors}
    }





}









/*
    User format:
                {
                  email:string,
              }
*/
async function getOrganizationDetails(organization){

      //let errors=[];

      console.log("\n\ngetOrganizationDetails organization: "+JSON.stringify(organization)+'\n')
      if ( organization==null||organization.organization_id==''|| organization.organization_id==''){
        return {success:false, errors:['Error - Not associated to an organization']}
      }

      const organizationDetailObj= await organizationMainInterface('getOrganizationDetails',{organization :organization}  );

      if(organizationDetailObj.success){

        let permissionToIsAllAccessFlag={'All-Access':true,'Limited-Access':false };

        return {
            success: true,
            organization:organizationDetailObj.organization
          }
      }else{
        return { success: false, errors:organizationDetailObj.errors}
      }

}


/*
      user format:{
            email:string
    }
*/
async function leaveOrganization(user){

    if(user==null){return {success:false, errors:['Empty User']}};
    console.log(" b4user: "+JSON.stringify(user))


     // user=(users_collection.find({email:user.email} ).toArray())[0];
     // console.log("after user: "+JSON.stringify(user))
    const organization_id=user.organization.organization_id;

    await users_collection.updateOne(
            {email:user.email },
            {$set:{
                      organization:{
                        name:'',
                        spreadsheet_id:'' ,
                        organization_id:'',
                      }
                  }
            }
    );

    return removeFromOrganization({
          organization_id:organization_id,
          userEmails: [user.email]
        }
    );


}

/*
      user format:{
            email:string
          }
*/
async function removeFromOrganization(organization){

    if(organization==null||Object.keys(organization).length==0) return {success:false,errors:['Fatal Error']};

    const result= await organizationMainInterface('removeFromOrganization', {organization:organization });

    if(result.success){
      return {success:true}
    }else{
      return {success:false, errors:result.errors}

    }
}

async function updateOrganizationPermissions(updateRequests, organization){

      if(updateRequests==null){return {success:false,errors:['Null Request']}};

      for(var[email,permission] of Object.entries(updateRequests)){
            let result=users_collection.updateOne({email:email}, {$set: {'organization.permission':permission}});

            if(result.matchedCount<1){
              return{success:false,errors:['Unable to update user with email '+email]}
            }

      }

      return await organizationMainInterface('updateOrganizationPermissions',{updateRequests:updateRequests,organization:organization });

}







/*
  MAIN SECTION : Supporting Functions Section
*/
async function doesUserExist(email){

      let results= await users_collection.find({ 'email':email } ).toArray();
      console.log(results>0);
      return results.length>0;

}

function isValidEmail(email){
    email = email.trim();

    const regex=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return regex.test(email);

}

function isValidPassword(password){

    errors=[]
    if(password.length<8){
        errors.push("Password must be greater than 8 characters");
    }

    return {isValidPassword: errors.length==0, errors:errors };
}
