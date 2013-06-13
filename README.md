# FS Mock API

FS Mock API is a node.js app designed to be used as a mock API service for
unit testing SDKs.

Requests to the app are mapped to a file in the data folder by concatentating
the HTTP request method with the request path. Then the media type is used to
lookup either the JSON or XML response.

Data sent in the request body of a `POST` is not validated.

## Example

```
GET /platform/tree/persons/12345/spouse-relationships
Accept: application/x-fs-v1+json
```
will open the `GET-platform-tree-persons-12345-spouse-relationships.json` file
and return the following response:

```
HTTP/1.1 200 OK
Content-Type: application/xx-fs-v1+json

{
  "relationships": [
    {
      "type": "http://gedcomx.org/Couple",
      "facts": [
        {
          "type": "http://gedcomx.org/Marriage",
          "date": {
            "original": "1 January 1786"
          },
          "place": {
            "original": "Boston, MA"
          }
        }
      ],
      "person1": {
        "resource": "/tree/persons/KJ8T-GZ1",
        "resourceId": "KJ8T-GZ1"
      },
      "person2": {
        "resource": "/tree/persons/KJ8T-GZ2",
        "resourceId": "KJ8T-GZ2"
      },
      "links": {
        "relationship": {
          "title": "Couple Relationship",
          "href": "https://familysearch.org/platform/tree/couple-relationships/KJ8T-GZ0"
        },
        "person1": {
          "title": "Conclusions",
          "href": "https://familysearch.org/platform/tree/persons/12345"
        },
        "person2": {
          "title": "Conclusions",
          "href": "https://familysearch.org/platform/tree/persons/12345"
        },
        "woman": {
          "title": "Conclusions",
          "href": "https://familysearch.org/platform/tree/persons/12345"
        },
        "man": {
          "title": "Conclusions",
          "href": "https://familysearch.org/platform/tree/persons/12345"
        }
      },
      "id": "KJ8T-GZ0"
    }
  ],
  "links": {
    "person": {
      "title": "Conclusions",
      "href": "https://familysearch.org/platform/tree/persons/12345"
    }
  }
} 
```