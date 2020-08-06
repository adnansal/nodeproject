/*
*Helpers for various tasks
*
*/

var crypto = require('crypto');
var config = require('../config');

//Container for all the helpers
var helpers={};

helpers.hash= function(str){
    if(typeof(str)=='string' && str.length > 0){
    var hash=crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
    return hash;
    }else {
    return false
}
}

//Pase a JSON string to an object in all cases, without throwing

helpers.parseJsonToObject=function(str){
    try{
        var obj=JSON.parse(str);
        return obj
    }catch(e){
      return {};
    }
}

module.exports=helpers;