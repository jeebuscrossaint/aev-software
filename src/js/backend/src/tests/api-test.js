import express from 'express';
const app = express();

app.get('/hello', (req, res) => {
	res.send('Hello World');
});
app.get('/goodbye', (req, res) => {
	res.send('Goodbye World');
});

app.listen(3003, () => {
	console.log('Server running on port 3002');
});