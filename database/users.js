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

const db_name='data2020';
const collection_name='users';

let collection;
(async function( ){

    await client.connect();
    collection=client.db(db_name).collection(collection_name);


})();


async function mainInterface(mode,paramsObj){

  try{

        if(mode=='signUp'){

                return await signUp(paramsObj.user);
        }else if(mode=='login'){
                return await login(paramsObj.user);
        }



  }catch(err){
    console.log(err);
  }

}

module.exports=mainInterface;

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
      userArray=await collection.find({email:userObj.email }).toArray();
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
        return {success:true, errors:errors, name:capitalize(user.name) };
    }else{
        return {success:false, errors:errors };
    }

}

function capitalize(str){//capitalize a given string
      if(str==null|| str==''|| str==undefined){ return ""}
      return str.charAt(0).toUpperCase() +str.toLowerCase().slice(1);
  }


/*
    Creates a user, storing details in database.
    // userObj Structure:
    //         {
    //           name: string
    //           email: unique
    //           password: [will be encrypted]
    //           organization: reference
    //          }
*/
async function signUp(userObj){

    let errors=[];

    if(userObj.name.trim().length<3){
        errors.push('Name must be greater than 2 characters' );
    }

    if (!isValidEmail(userObj.email)){
      errors.push('Email is not valid!' );
    }

    if(await doesUserExist(userObj.email)){
      errors.push('Existing email!');
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
              await collection.insertOne(userObj);
        });

    } );

    if(success){
      return {success:true , errors:errors };
    }else{
      return {success:false , errors:errors };
    }
}

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
