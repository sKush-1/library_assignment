# Node.js Backend Typescript Project


Note: Render spins down a Free web service that goes 15 minutes without receiving inbound traffic. Render spins the service back up whenever it next receives a request to process.

Spinning up a service takes up to a minute, which causes a noticeable delay for incoming requests until the service is back up and running. For example, a browser page load will hang temporarily.

<br>

# Project Highlights 
1. Node.js
2. Express.js
3. Typescript
4. Mongoose
5. Mongodb
6. Zod
7. JWT


# Project Instructions
<br>
Following are the features of this project:
* **This backend is written in Typescript**: The type safety at build time and having intellisense for it in the IDE like vscode is unparalleled to productivity. I have found production bug reduced to a significant amount since most of the code vulnerabilities are identified during the build phase itself.
* **Separation of concern principle**: Each component has been given a particular role. The role of the components is mutually exclusive. This makes the project easy to be unit tested.
* **Mongodb is used through Mongoose**: Mongodb fits very well to the node.js application. Being NoSQL, fast, and scalable makes it ideal for modern web applications.
* **Async execution**: I have used async/await for the promises and made sure to use the non-blocking version of all the functions with few exceptions.
* **Unit test is favored**: The tests have been written to test the functions and routes without the need of the database server. Integration tests has also been done but the unit test is favored.

# Test API's using Postman
<br>

Postman Collection Link -: https://www.postman.com/material-administrator-30762984/my-collections/collection/iaodvxt/library-assignment

Backend URL -: https://library-assignment-en05.onrender.com

Refer to /testingData to see how mongodb collections stored and create more documents.
password for each user is 12345678



     
 
