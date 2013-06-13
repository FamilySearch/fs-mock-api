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
  fs.readFile(sourceDir + '/' + usecaseFile.replace('../',''), function(err, data){
    
    if(err) {
      console.error('Error reading use case file: ' + usecaseFile);
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
    var destinationPath = destinationDir + '/' + requestMethod + requestPath.replace(/\//g,'-').replace(/\./g,'') + '.json';
    fs.writeFile(destinationPath, data, function(err){
      if(err) {
        console.error('Error creating ' + destinationPath);
      } else {
        console.log('Saved ' + destinationPath);
      }
    });
    
  });
}
