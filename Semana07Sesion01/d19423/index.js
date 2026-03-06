// // const moment = require('moment');
// // moment.locale('es');
// // console.log("Inicio de la aplicacion de nodejs con nodemon a las "+moment().format("[Hoy dia es] dddd"))

// // Import the HTTP module
// const http = require('http');

// // Create a server object
// const server = http.createServer((req, res) => {
//   // Set the response HTTP header with HTTP status and Content type
// //   res.writeHead(200, { 'Content-Type': 'text/html' });

// //   // Send the response body as 'Hello, World!'
// //   res.end('Hello, World!\n');
// // const userAgent = req.headers['user-agent'];
// //   const acceptLanguage = req.headers['accept-language'];

// //   res.writeHead(200, { 'Content-Type': 'text/plain' });
// //   res.end(`User-Agent: ${userAgent}\nAccept-Language: ${acceptLanguage}`);
// const { url, method } = req;

//   res.writeHead(200, { 'Content-Type': 'text/plain' });
//   res.end(`You made a ${method} request to ${url}`);

// });

// // Define the port to listen on 
// const PORT = 3000;

// // Start the server and listen on the specified port
// server.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}/`);
// });


const http = require('http');
const axios = require('axios');
let url = require('url');
require('dotenv').config();

const PORT = process.env.PORT;

let config = {};

let server = http.createServer((req, res) => {
    let q = url.parse(req.url, true);
    console.log(q);
    let path = q.pathname;
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    const searchParams = requestUrl.searchParams;
   // console.log(path);

    switch (path) {
        case '/clima':
            let cuidad = searchParams.get('ciudad');
            config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `https://weather-api99.p.rapidapi.com/weather?city=${cuidad}`,
                headers: {
                    'x-rapidapi-host': 'weather-api99.p.rapidapi.com',
                    'x-rapidapi-key': process.env.RAPIDKEY
                }
            };

            axios.request(config)
                .then((response) => {
                   // console.log(response.data);
                    let temp = Math.round(response.data.main.temp - 273.15);
                    res.end("Complatado = " + temp);

                })
                .catch((error) => {
                    console.log(error);
                });

            break;
        case '/pelicula':
            let titulo = searchParams.get('titulo');
            config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `https://imdb236.p.rapidapi.com/api/imdb/search?originalTitle=${titulo}&rows=20`,
                headers: {
                    'x-rapidapi-host': 'imdb236.p.rapidapi.com',
                    'x-rapidapi-key': process.env.RAPIDKEY
                }
            };

            axios.request(config)
                .then((response) => {
                    console.log(response.data.results);
                    let results = response.data.results
                    let strHTML = "<div>";
                    results.forEach(element => {
                        console.log(element.primaryTitle)
                        console.log(element.startYear)
                        strHTML+=`<h1>${element.primaryTitle}</h1><h3>${element.startYear}</h3><br>`
                    });
                    strHTML += '</div>'
                    res.end(strHTML)
                })
                .catch((error) => {
                    console.log(error);
                });

        default:
            break;
    }

});

server.listen(PORT, () => {
    console.log(`Servidor escuchando el puerto ${PORT}`)
})
