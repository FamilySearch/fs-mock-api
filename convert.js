var fs = require('fs');

var sourceDir = 'convert',
    destinationDir = 'data';

// Clear the destination directory
fs.readdir(destinationDir, function(err, files){
  files.forEach(function(file, index){
    fs.unlinkSync(destinationDir + '/' + file);
  });
  findUsecaseLists();
});
    
// Open the project file
function findUsecaseLists() {
  fs.readFile(sourceDir + '/project.json', function(err, data) {

    if(err) {
      console.error('Error reading project.json');
      process.exit(1);
    }
    
    var projectFile = JSON.parse(data);
    
    // Iterate over the namespaces and find usecase files
    for(var i = 0; i < projectFile.namespaces.length; i++) {
      if(projectFile.namespaces[i].usecases) {
        processUsecaseList(projectFile.namespaces[i].usecases.href);
      }
    }
  });
}

// Open a use case list file and process use cases
function processUsecaseList(usecaseList) {
  fs.readFile(sourceDir + '/' + usecaseList, function(err, data) {
    
    if(err) {
      console.error('Error reading use case list file: ' + usecaseList);
    }
    
    var usecases = JSON.parse(data);
    for(var i = 0; i < usecases.usecases.length; i++) {
      processUsecaseFile(usecases.usecases[i].href)
    }
    
  });
}

// Open a use case file and save it in the data path as a mock api source
function processUsecaseFile(usecaseFile) {
  var data = fs.readFileSync(sourceDir + '/' + usecaseFile.replace('../','')),
      usecase = JSON.parse(data);
    
  // Extract the request method and path
  var requestMethod, requestPath;
  for(var mediaType in usecase.requests) {
    requestMethod = usecase.requests[mediaType].operation;
    requestPath = usecase.requests[mediaType].path;
    break;
  }
  
  var destinationPath = destinationDir + '/' + requestMethod + requestPath.replace(/\//g,'-').replace(/\./g,'') + '.json';
  
  // Validate the length of the file name.
  // What should we do about names that are too long?
  if( destinationPath.length > 255 ) {
    console.error('File name too long: %s', destinationPath);
    return;
  }
  
  // Save the usecase if a file with it's name doesn't already exist
  var exists = fs.existsSync(destinationPath);
  if( exists) {
    console.error('File already exists: %s', destinationPath);
  } else {      
    fs.writeFileSync(destinationPath, data);
  }

}
