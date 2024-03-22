const mysql = require("mysql2");

const config = {
  host: "localhost",
  user: "root", 
  password: "nicha12345", 
  database: "PROJECT_Frontend"
};

const connection = mysql.createConnection(config);
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database.');
});

module.exports = connection