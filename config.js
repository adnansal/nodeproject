/*
*Create and export configuration variables
*
*/

//container for all the envirnoments
var environments={};

//Staging(default) environment

environments.staging ={
'port': 3000,
'envName':'staging'
};

//Production environment
environments.production={
'port': 5000,
'envName':'production'
}

//Determine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : ''

//check current environment is valid or not
var environmentToExport=typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging


module.exports= environmentToExport;