var fs = require('fs');

var sourceDir = 'convert',
    destinationDir = 'data';

// Open the project file
fs.readFile(sourceDir + '/project.json', function(err, data) {

  if(err) {
    console.error('Error reading project.json');
    process.exit(1);
  }
  
  var projectFile = JSON.parse(data);
  
  // Iterate over the namespaces and find usecase files
  for(var i = 0; i < projectFile.namespaces.length; i++) {
    if(projectFile.namespaces[i].usecases) {
      processUsecaseListFile(projectFile.namespaces[i].usecases.href);
    }
  }

});

// Open a use case list file and process use cases
function processUsecaseListFile(usecaseListFile) {
  fs.readFile(sourceDir + '/' + usecaseListFile, function(err, data) {
    
    if(err) {
      console.error('Error reading use case list file: ' + usecaseListFile);
    }
    
    var usecases = JSON.parse(data);
    for(var i = 0; i < usecases.usecases.length; i++) {
      processUsecaseFile(usecases.usecases[i].href)
    }
    
  });
}

// Open a use case file and save it in the data path as a mock api source
function processUsecaseFile(usecaseFile) {
  fs.readFile(sourceDir + '/' + usecaseFile.replace('../',''), function(err, data){
    
    if(err) {
      console.error('Error readign use case file: ' + usecaseFile);
    }
    
    var usecase = JSON.parse(data);
    
    // Extract the request method and path
    var requestMethod, requestPath;
    for(var mediaType in usecase.requests) {
      requestMethod = usecase.requests[mediaType].operation;
      requestPath = usecase.requests[mediaType].path;
      break;
    }
    
    // Save the usecase
    var destinationPath = destinationDir + '/' + requestMethod + requestPath.replace(/\//g,'-') + '.json';
    fs.writeFile(destinationPath, data, function(err){
      if(err) {
        console.error('Error creating ' + destinationPath);
      } else {
        console.log('Saved ' + destinationPath);
      }
    });
    
  });
}
