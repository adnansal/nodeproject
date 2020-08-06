/*
*Create and export configuration variables
*
*/

//container for all the envirnoments
var environments={};

//Staging(default) environment

environments.staging ={
'httpPort': 3000,
'httpsPort':3001,
'envName':'staging',
'hashingSecret' : 'thisIsABadIdea'
};

//Production environment
environments.production={
'httpPort': 5000,
'httpsPort':5001,
'envName':'production',
'hashingSecret' : 'thisIsABadIdea'
}

//Determine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : ''

//check current environment is valid or not
var environmentToExport=typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging


module.exports= environmentToExport;