// GET request to the following routes for localhost:3002: /hello, /goodbye
// Print all responses to the console
import axios from 'axios';

const responses = {};

const api = axios.create({
	  baseURL: 'http://localhost:3003',
});

api.get('/hello')
	.then((response) => {
		responses['/hello'] = response;
		console.log(response.data);
	})
api.get('/goodbye')
	.then((response) => {
		responses['/goodbye'] = response;
		console.log(response.data);
	})


// When everything is done, print all responses
// api.all([api.get('/hello'), api.get('/goodbye')])
// 	.then(axios.spread((...responses) => {
// 		console.log(responses);
// 	}));
