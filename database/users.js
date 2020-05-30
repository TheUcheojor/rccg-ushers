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
                return await updateOrganization(paramsObj.user,paramsObj.connection_obj)
        }



  }catch(err){
    console.log(err);
    return {sucess:false errors:['Unexpected Database Error']}
  }

}

module.exports=mainInterface;



/*
    MAIN SECTION : Interface Functions Setion
*/

/*
      Subsection - Users' Interactions with their account
*/

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
        return {success:true, errors:errors, name:user.name};
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
    bcrypt.genSalt(saltRounds, (err ,salt)=>{
        bcrypt.hash(userObj.password, salt, async (err,hash)=>{
              if(err){
                console.log(err);
                success=false;
                errors.push('Password hashing error');
                return;
              }
              userObj.password=hash;
              userObj.organization='';
              await users_collection.insertOne(userObj);
        });

    } );

    if(success){
      return {success:true , errors:errors };
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

        }

*/
async function createOrganization(user){

      let organization={
                        owner_name:user.name,
                        owner_email:user.email,
                        organization_name:user.organization_name

     } ;

      //const resultObj=await


}

async function updateOrganization(user,connection_obj){

      const result= await users_collection.updateOne(
            {
              email:user.email
            },
            {
              $set:{
                organization:
                    {
                        organization_id:connection_obj,
                        permission:user.permission

                    }
              }
            }
     );

     if( result.matchedCount<1){
       return {success: false}
     }

     return {success: true }

}




/*
    User format:
                {
                  email:string,
              }
*/
async function getOrganizationDetails(user, connection_obj){

      //let errors=[];

      const userArr= users_collection.find({email:user.email}).toArray();
      const user=userArr[0];

      if (user.organization==''){
        return {sucess:false, errors:['No organization associated with your account']}
      }

      const organizationDetailObj= organizationMainInterface('getOrganizationDetails',
                      {
                        organization_id:user.organization.organization_id
                      }
                  );

      if(organizationDetailObj.success){

        let permissionToIsAllAccessFlag={'All-Access':true,'Limited-Access':false };

        return {
            success: true,
            isAllAccess:permissionToIsAllAccessFlag[user.organization.permission] ,
            organization_details:organizationDetailObj.details

          }
      }else{
        return { sucess: false, errors:organizationDetailObj.errors}
      }

}








/*
  MAIN SECTION : Supporting Functions Section
*/
async function doesUserExist(email){

      let results= await collection.find({ 'email':email } ).toArray();
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
