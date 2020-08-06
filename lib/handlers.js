/*
*These are the request handlers
*
*/

//Dependencies
var _data=require('./data');
var helpers=require('./helpers');



//Define the handlers
var handlers={};

//sample handler
handlers.ping=function(data,callback){
//Callback a http status code, and a payload object
callback(200);

};

handlers.hello=function(data,callback){
    //Callback a http status code, and a payload object
    callback(200,{'Message' : 'Welcome to the API'});
    
    };

//Not found handler
handlers.notFound=function(data,callback){
callback(404);
};

handlers.users=function(data,callback){
    var acceptableMethods=['get','post','put','delete'];
    if(acceptableMethods.indexOf(data.method)>-1){
        handlers._users[data.method](data,callback)
    }else{
        callback(405);
    }
}

//Container for the users submethods
handlers._users={}

//Users- post
//Required Data: firstname,lastname,phone,password,tosAgreement
//Optional data:none


//Users - get
//Required data:phone
//Optional data: none
//TODO only let authenticated user ac++c+ess their object .Don't let them access anyone else's data
handlers._users.get= function(data,callback){
  //check the phone number provided is valid
  var phone=typeof(data.queryStringObject.phone) =='string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if(phone){
      _data.read('users',phone,function(err,data){
          if(!err && data){
               //Remove the hashed password from the user object before returing it to the user
               delete data.hashedPassword
               callback(200,data)
          }else{
              callback(404,{'Error' : 'User does not exist'})
          }
      })
  }else{
      callback(400,{'Error' : 'Missing Required Field / Invalid Phone Number'})
  }
}
handlers._users.post= function(data,callback){
 //Check that all required field are filled out
 var firstname=typeof(data.payload.firstname) =='string' && data.payload.firstname.trim().length > 0 ? data.payload.firstname.trim() : false;
 var lastname=typeof(data.payload.lastname) =='string' && data.payload.lastname.trim().length > 0 ? data.payload.lastname.trim() : false;
 var phone=typeof(data.payload.phone) =='string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
 var password=typeof(data.payload.password) =='string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
 var tosAgreement=typeof(data.payload.tosAgreement) =='boolean' && data.payload.tosAgreement == true ? true : false;

 if(firstname && lastname && phone && password && tosAgreement){
    //Make sure that the user doesn't already exist
    _data.read('users',phone,function(err,data){
       if(err){
         //Hash the password
         var hashedPassword = helpers.hash(password)

         if(hashedPassword){
             //Create the user object
         var userObject={
            'firstName' : firstname,
            'lastName' :lastname,
            'phone' : phone,
            'hashedPassword' : hashedPassword,
            'tosAgreement' : true
        };

        _data.create('users',phone,userObject,function(err){
            if(!err){
               callback(200)
            }else{
                console.log(err);
                callback(500,{'Error' : 'Could not create the new user'})
            }
        })
         } else{
             callback(500,{'Error': 'Could not hash the user\'s password'})
         }  
       }else{
           callback(400,{'Error':'User with this phone number already exist'})
       }
    });

 }else{
     callback(400,{'Error' : 'Missing required fields'});
 }
}


//Users- put
//Required data : phone
//Optional data: firstname,lastname,password(at least one should be specified)
//TODO only let authenticated user ac++c+ess their object .Don't let them access anyone else's data
handlers._users.put= function(data,callback){
 // check for the phone number
 var phone=typeof(data.payload.phone) =='string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

 //check for the optional field 
 var firstname=typeof(data.payload.firstname) =='string' && data.payload.firstname.trim().length > 0 ? data.payload.firstname.trim() : false;
 var lastname=typeof(data.payload.lastname) =='string' && data.payload.lastname.trim().length > 0 ? data.payload.lastname.trim() : false;
 var password=typeof(data.payload.password) =='string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

 if(phone){
     //Error if nothing is sent to update
     if(firstname || lastname || password){
        _data.read('users',phone,function(err,userData){
            if(!err && userData){
                  if(firstname){
                      userData.firstName=firstname;
                  }
                  if(lastname){
                    userData.lastName=lastname;
                }
                if(password){
                    var hashedPassword = helpers.hash(password)
                    userData.hashedPassword=hashedPassword;
                }

                //Store the new updates
                _data.update('users',phone,userData,function(err){
                    if(!err){
                      callback(200);
                    }else{
                        console.log(err)
                        callback(500,{'Error' : 'Could not update the user'})
                    }
                })
            }else{
                callback(400,{'Error' : 'Specified user does not exist'})
            }
        })
     }else{
         callback(400,{'Error' : 'Missing field to update'})
     }
 }else{
     callback(400,{'Error' : 'Missing Required field'})
 }
}


//Users - delete
//Required field  :phone
//Todo only let an authenticated user delete thier object. Don't let them delete anyone
//Todo cleanup (delete) any other data files associated with this user
handlers._users.delete= function(data,callback){
 //check the phone number provided is valid
 var phone=typeof(data.queryStringObject.phone) =='string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
 if(phone){
     _data.read('users',phone,function(err,data){
         if(!err && data){
              //Remove the hashed password from the user object before returing it to the user
              _data.delete('users',phone,function(err){
                  if(!err){
                     callback(200);
                  }else{
                      callback(500,{'Error' : 'Could not delete the specified user'});
                  }
              })
         }else{
             callback(400,{'Error' : 'Could not find the specified user'})
         }
     })
 }else{
     callback(400,{'Error' : 'Missing Required Field / Invalid Phone Number'})
 }
}


handlers.tokens=function(data,callback){
    var acceptableMethods=['get','post','put','delete'];
    if(acceptableMethods.indexOf(data.method)>-1){
        handlers._tokens[data.method](data,callback)
    }else{
        callback(405);
    }
}

//Container for all the tokens methods
handlers._tokens={};

//Tokens - post
//Required data - Phone , password
//Optional data - none
handlers._tokens.post=function(data,callback){
var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim(): false
var password = typeof(data.payload.password) == 'string' && data.payload.phone.trim().length > 5 ? data.payload.password.trim() : false

if (phone && password){
//lookup the user who matches that phone number
_data.read('users',phone,function(err,userData){
    if(!err && userData ){
       var hashedPassword = helpers.hash(password)
       if (hashedPassword== userData.hashedPassword){
           //If Valid create a new token with a random name.set expiration date 1 hour in future
            var tokenId=helpers.createRandomString(20);
            var expires = Date.now() + 1000 * 60 * 60
            var tokenObject={
                'phone' : phone,
                'id' : tokenId,
                'expires' :expires
            }

            //Store the token
            _data.create('tokens',tokenId,tokenObject,function(err){
                if(!err){
                    callback(200,tokenObject);

                }else{
                    callback(500,{'Error' : 'Error in creating the new token'})
                }
            })
       }else{
           callback(400,{'Error' : 'Password did not match the specified user\'s stored password' })
       }
    }else{
        callback(400,{'Error' : 'Could not find the specified user'})
    }
})

}else{
    callback(400,{'Error' : 'Missing Phone or Password'})
}

}

//Tokens - Get 
//Required data - Token Id
//Optional data - None
handlers._tokens.get=function(data,callback){
var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false

if(id){
    _data.read('tokens',id,function(err,tokenData){
        if(!err && tokenData){
            callback(200,tokenData);
        }
        else{
            callback(400,{'Error' : 'Token not found'})
        }
    })

}else{
    callback(400,{'Error' : 'Missing required field'})
}

}

//Tokens - Put
handlers._tokens.put=function(data,callback){


}

//Tokens - Delete
handlers._tokens.delete=function(data,callback){


}








module.exports=handlers;
