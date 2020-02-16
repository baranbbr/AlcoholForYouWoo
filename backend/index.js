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

// registration
app.post('/register', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var weight = req.body.weight;
	var height = req.body.height;
	var gender =  req.body.gender;
	console.log(req);
	if (username && password && email && weight && height) {
		connection.query(`INSERT INTO Users (Name, Email, Weight, Height, Password, PersonID, Gender) VALUES (?, ?, ?, ? ,?, ?, ?)`,[username, email, weight, height, password, 0, gender] , function(error, results, fields) {
			if (error){
				throw error;
			}
			if (results.lenght>0) {
                console.log(results)
			}		
			res.end();
		});
	} else {
		res.send('Please enter all the data!');
		res.end();
	}
});

// authentication
app.post('/auth', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	if (username && password) {
		connection.query('SELECT PersonID FROM Users WHERE Name = ? AND Password = ?', [username, password], function(error, results, fields) {
            if (error) throw error;
			if (results.length > 0) {
				req.session.personID = results[0].PersonID;
				req.session.loggedin = true;
				req.session.username = username;
				//req.session.userID = 
				res.redirect('http://localhost:5500/index.html');
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

// home
app.get('/home', function(req, res) {
	if (req.session.loggedin) {
		res.send('Welcome back, ' + req.session.username + '!');
	} else {
        res.sendFile(path.join(__dirname + '/../login.html'));
	}
	res.end();
});

// returns all sessions (id and name)
app.get('/sessions', function(req, res){
	if (req.session.loggedin) {
		connection.query('SELECT SeshID, SeshName FROM Session',function(error, results, fields){
			res.send(results);
		})
	}
	else {
        res.sendFile(path.join(__dirname + '/../login.html'));
	}
	res.end();
})

// create session
app.post('/session', function(req, res) {
	if (req.session.loggedin) {
		var seshID = req.body.SeshID;
		var userID = req.session.seshID;
		connection.query('INSERT INTO Session(SeshName, SeshAddress, SeshDate) VALUES (?, ?, ?)', [seshID, address, date], function(error, results, fields) {
			if (error) throw error;
			else
				res.send("Success")
		})
		} else {
        res.sendFile(path.join(__dirname + '/../login.html'));
	}
	res.end();})

// join session user link
app.post('/join_session', function(req, res){
	if (req.session.loggedin) {
		var SeshID = req.body.SeshID;
		var UserID = req.session.personID;
		connection.query('INSERT INTO Session_User_Link (SeshID, UserID) (?, ?)', [SeshID, UserID], function(error, results, fields) {
			if (error) throw error;
			else{
				req.session.User_Session_ID = results[0].User_Session_ID
				res.send("Success")
			}
		})
		} else {
        res.sendFile(path.join(__dirname + '/../login.html'));
	}
res.end();})

// select drink
// name = drink name
app.get('/sessions', function(req, res){
	var drink_name = req.body.name;
	if (req.session.loggedin) {
		connection.query('SELECT DrinkName FROM Alcohol WHERE DrinkName LIKE %?%', [drink_name],function(error, results, fields){
			res.send(results);
		})
	}
	else {
        res.sendFile(path.join(__dirname + '/../login.html'));
	}
	res.end();
})


// add drink to drink user sesh
// drinkID - drink id | amount - amount of drink
app.post('/add_drink', function(req, res){
	var drinkID = req.body.drinkID
	var amount = req.body.amount
	if (req.session.loggedin) {
		connection.query('IF NOT EXISTS ( SELECT 1 FROM DrinkUserSesh WHERE User_Session_ID = ? AND DrinkID = ? ) BEGIN INSERT INTO DrinkUserSesh (Amount, DrinkID, User_Session_ID) VALUES (?, ?, ?) END', [req.session.User_Session_ID,drinkID, amount,req.session.User_Session_ID,drinkID],function(error, results, fields){
			if(error) throw error
			if(results.lenght>0){
				res.send("Setted new drink in session!")
			}
			else {
				connection.query('UPDATE DrinkUserSesh SET Amount = Amount + 1 WHERE User_Session_ID = ? AND DrinkID = ?', [req.session.User_Session_ID,drinkID],function(error, results, fields){
					if (error) throw error
					res.send(results)
				})
			}
		})
	}
	else {
        res.sendFile(path.join(__dirname + '/../login.html'));
	}
	res.end();
})

// get all users from current session user link
app.get('/session_current', function(req, res){
	if (req.session.loggedin) {
		connection.query('SELECT UserID FROM Session_User_Link WHERE SeshID = ?`', [req.session.User_Session_ID],function(error, results, fields){
			if (error) throw error
			res.send(results);
		})
	}
	else {
        res.sendFile(path.join(__dirname + '/../login.html'));
	}
	res.end();
})

// get user by UserID
app.get('/user', function(req, res){
	var UserID = req.body.userID
	if (req.session.loggedin) {
		connection.query('SELECT Name FROM Users WHERE UserID = ?', [UserID],function(error, results, fields){
			if (error) throw error
			res.send(results);
		})
	}
	else {
        res.sendFile(path.join(__dirname + '/../login.html'));
	}
	res.end();
})

// get all drinks from user_session_id
app.get('/get_user_drinks', function(req, res){
	var session_id = req.body.u_sesh_id
	if (req.session.loggedin) {
		connection.query('SELECT * FROM DrinkUserSesh WHERE User_Session_ID = ?', [session_id],function(error, results, fields){
			if (error) throw error
			res.send(results);
		})
	}
	else {
        res.sendFile(path.join(__dirname + '/../login.html'));
	}
	res.end();
})

// get drink by id
app.get('/drink', function(req, res){
	var drinkID = req.body.drinkID;
	if (req.session.loggedin) {
		connection.query('SELECT * FROM Alcohol WHERE DrinkID = ?', [drinkID],function(error, results, fields){
			if (error) throw error
			res.send(results);
		})
	}
	else {
        res.sendFile(path.join(__dirname + '/../login.html'));
	}
	res.end();
})

//code Owain did that is broke AF

app.listen(port, () => console.log(`App listening on port ${port}`));