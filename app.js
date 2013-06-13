var http = require('http'),
    url = require('url'),
    fs = require('fs');

// Multiple media types are valid and will return the same data,
// however the use cases we use are associated with only one media
// type. This mapping enables any valid media type to be requested
// and still return the proper response.
var mediatypeSynonyms = {
  'application/x-gedcomx-v1+json': [  
    'application/x-fs-v1+json',
    'application/json'
  ],
  'application/x-fs-v1+json': [
    'application/x-gedcomx-v1+json',
    'application/json'
  ],
  'application/x-gedcomx-atom+json': [
    'application/json'
  ],
  'application/json': [
    'application/x-gedcomx-v1+json',
    'application/x-fs-v1+json',
    'application/x-gedcomx-atom+json'
  ],
  'application/x-gedcomx-v1+xml': [  
    'application/x-fs-v1+xml',
    'application/xml'
  ],
  'application/x-fs-v1+xml': [
    'application/x-gedcomx-v1+xml',
    'application/xml'
  ],
  'application/atom+xml': [
    'application/xml'
  ],
  'application/xml': [
    'application/x-gedcomx-v1+xml',
    'application/x-fs-v1+xml',
    'application/atom+xml'
  ]
};
    
http.createServer(function(req, res){

  // Get the requested url and method
  var requestUrl = url.parse(req.url).path,
      requestMethod = req.method,
      requestAcceptHeader = req.headers.accept;
  
  // Convert the url to a file name
  var requestFilename = 'data/' + requestMethod + requestUrl.replace(/\//g,'-').replace(/\./g,'') + '.json';
  
  // See if the file exists
  fs.readFile(requestFilename, { encoding: 'utf8' }, function(err, data){
  
    // TODO: mimic API error reporting
    if(err) {
      res.statusCode = 500;
      res.end(err.name + '::' + err.message);
      return;
    }
    
    var usecase = JSON.parse(data);
    
    // Need to track the matching requested media type
    // and associated use case media type seperately. The
    // requested media type gets returned in the content-type
    // header while the matching usecase media type is used
    // to lookup the response details from the use case object
    var matchingUsecaseMediaType = null,
        matchingRequestedMediaType = null,
        responseData;
    
    // Iterate over use case request media types and their synonyms.
    // When we find a match, return the associated data from the
    // use case as well as the matching media type.
    mediatypeMatching:
    for(var usecaseType in usecase.requests) {
      
      // The current use case media type matches a value
      // in the accept header
      if( requestAcceptHeader.indexOf(usecaseType) != -1 ) {
        matchingUsecaseMediaType = matchingRequestedMediaType = usecaseType;
        break;
      } 
      
      // If the current use case media type was not requested,
      // try the synonyms
      else {
        var synonym;
        for(var i = 0; i < mediatypeSynonyms[usecaseType].length; i++) {
          synonym = mediatypeSynonyms[usecaseType][i];
          if( requestAcceptHeader.indexOf(synonym) != -1 ) {
            matchingUsecaseMediaType = usecaseType;
            matchingRequestedMediaType = synonym;
            break mediatypeMatching;
          }
        }
      }      
    }
    
    // Return a 406 error if we didn't find a matching media type
    if( matchingUsecaseMediaType == null ) {
      res.statusCode = 406;
      res.end('No data available for media types: ' + requestAcceptHeader);
      return;
    }
    
    // Return the matching data
    responseData = usecase.requests[matchingUsecaseMediaType].response;
    res.statusCode = responseData.code;
    res.setHeader('Content-Type', matchingRequestedMediaType);
    /* TODO: should we return the headers?
    for(var i = 0; i < responseData.headers; i++) {
      res.setHeader(responseData.headers[i].name, responseData.headers[i].value);
    }
    */
    res.end(responseData.body);
  
  });

}).listen(6834, '127.0.0.1');