// GET request to the following routes for localhost:3002: /, /bms, /bms/data, /bms/restart, /gps, /gps/data, /gps/restart
// Print all responses to the console
import axios from 'axios';

const responses = {};

const api = axios.create({
	baseURL: 'http://localhost:3002',
});

api.get('/')
	.then((response) => {
		responses['/'] = response;
		console.log(response);
	});

api.get('/bms')
	.then((response) => {
		responses['/bms'] = response;
		console.log(response);
	});
api.get('/bms/data')
	.then((response) => {
		responses['/bms/data'] = response;
		console.log(response);
	});
api.get('/bms/restart')
	.then((response) => {
		responses['/bms/restart'] = response;
		console.log(response);
	});

api.get('/gps')
	.then((response) => {
		responses['/gps'] = response;
		console.log(response);
	});
api.get('/gps/data')
	.then((response) => {
		responses['/gps/data'] = response;
		console.log(response);
	});
api.get('/gps/restart')
	.then((response) => {
		responses['/gps/restart'] = response;
		console.log(response);
	});


// When everything is done, print all responses
// api.all([api.get('/'), api.get('/bms'), api.get('/bms/data'), api.get('/bms/restart'), api.get('/gps'), api.get('/gps/data'), api.get('/gps/restart')])
// 	.then(axios.spread((...responses) => {
// 		console.log(responses);
// 	}));