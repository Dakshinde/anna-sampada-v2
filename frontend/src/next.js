var express = require('express');
var app = express();
var port = 3000;

var home = express.Router();
var admin = express.Router();

home.get("/profile" , (req,res,next) => {
    console.log("Profile Route Acessed");
    res.send("Profile Router Working");
});

admin.get("/admin" , (req,res,next) => {
    console.log("Admin Route Acessed");
    res.send("Admin Router Working");
});

app.use('/',home);
app.use('/',admin);

app.listen(port , (err) => {
    if (err) 
        console.error(err);
    console.log(`Server Listening at http://localhost:${port}`)
});