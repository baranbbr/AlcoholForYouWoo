require('dotenv').config();
const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;

// Connect to sql server
const connection = mysql.createConnection({
    host     : '51.83.46.159',
	user     : 'root',
	password : 'sven123',
	database : 'CovHack'
});

var app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/../login.html'));
});

app.post('/register', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var weight = req.body.weight;
	var height = req.body.height;
	var gender =  req.body.gender;
	if (username && password && email && weight && height) {
		connection.query(`INSERT INTO Users (Name, Email, Weight, Height, Password, PersonID, Gender) VALUES (?, ?, ?, ? ,?, ?, ?)`,[username, email, weight, height, password, 0, gender] , function(error, results, fields) {
			if (error){
				throw error;
			}
			if (results.lenght>0) {
                console.log(results)
			} else {
				res.send('Error during register!');
			}			
			res.end();
		});
	} else {
		res.send('Please enter all the data!');
		res.end();
	}
});


app.post('/auth', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	if (username && password) {
		connection.query('SELECT * FROM Users WHERE Name = ? AND Password = ?', [username, password], function(error, results, fields) {
            if (error) throw error;
			if (results.length > 0) {
				req.session.loggedin = true;
                req.session.username = username;
				res.redirect('/home');
			} else {
				res.send('Incorrect Username and/or Password!');
			}			
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});

app.get('/home', function(req, res) {
	if (req.session.loggedin) {
		res.send('Welcome back, ' + req.session.username + '!');
	} else {
        res.sendFile(path.join(__dirname + '/../login.html'));
	}
	res.end();
});

app.listen(port, () => console.log(`App listening on port ${port}`));