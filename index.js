/* 
*Primary file for API
*
*/

//Dependencies

var http = require('http');
var url = require('url');
var https=require('https');
const {StringDecoder} = require('string_decoder');
var config = require('./config');
var fs=require('fs')
var _data=require('./lib/data')
var handlers=require('./lib/handlers')
var helpers=require('./lib/helpers')
//TODO delete the below file
/*testing data read write
_data.create('test','newFile',{'foo' : 'bar'},function(err){
    console.log('this was the error',err)
}) 
_data.read('test','newFile',function(err,data){
    console.log('this was the error',err,'and this was the data',data)
})

_data.update('test','newFile',{'Adnan' : 'Devika'},function(err){
    console.log('this was the error',err)
}) 
_data.delete('test','new',function(err){
    console.log('this was the error',err)
})*/


//define what the server does first and than make it listen on a port
//The server would respond to all the request with a string

//instantiating the HTTP server
var httpServer = http.createServer(function(req,res){
    unifiedServer(req,res);
});

//Start the server 
httpServer.listen(config.httpPort,function(){
   console.log("The server is listening on port "+config.httpPort+" now");
  
})

//instantiating the HTTPS server
httpsServerOptions={
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem') 
};
var httpsServer = https.createServer(httpsServerOptions,function(req,res){
    unifiedServer(req,res);
});

//Start the server 
httpsServer.listen(config.httpsPort,function(){
   console.log("The server is listening on port "+config.httpsPort+" now");
  
})



//All the server logic for both HTTP and HTTPS server
var unifiedServer = function(req,res){

    //get the URL and parse it
    var parsedURL = url.parse(req.url,true);
    

    //get the path from URL
    var path=parsedURL.pathname;
    var trimmedPath=path.replace(/^\/+|\/+$/g,'');
     
    //Get the query string as an object
    var queryStringObject = parsedURL.query;

    //Get the HTTP Method
    var method=req.method.toLowerCase();
    
    //Get the headers as an object
    var headers=req.headers;

    //get the payload , if any
    var decoder = new StringDecoder('utf-8');
    var buffer='';
    req.on('data',function(data){
    buffer+=decoder.write(data);
    });
    req.on('end',function(){
    buffer+=decoder.end();
    
    //choose a handler if handler not found call notfound handler
    var choosenHandler=typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath]:handlers.notFound;

    //construct the data object to send to handler
    var data={
        'trimmedPath' : trimmedPath,
        'queryStringObject' : queryStringObject,
        'method' : method,
        'headers' : headers,
        'payload' : helpers.parseJsonToObject(buffer)
    }

    //Route the request to the handler specified in the router
    choosenHandler(data,function(statusCode,payload){
        //use the status code called back by the handler or default to 200
        statusCode=typeof(statusCode) == 'number' ? statusCode : 200;
        //Use the payload call back by the handler , or default to an empty object
        payload =typeof(payload)=='object' ? payload : {};

        //Convert the payload to a string
        var payloadString = JSON.stringify(payload);
        

        //Return the response
        res.setHeader('Content-Type','application/json');
        res.writeHead(statusCode);
        res.end(payloadString);

        //Log the request
        console.log('Returning the response: ', statusCode,payloadString);

        }); 
    }); 
}

//define a request router
var router={
    'ping' : handlers.ping,
    'users' : handlers.users,
    'tokens' : handlers.tokens
};