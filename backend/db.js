const mysql = require('mysql');

// Configura la connessione al database
const connection = mysql.createConnection({
    host: 'localhost', // Cambia se necessario
    user: 'root',      // Cambia con il tuo username MySQL
    password: '',      // Cambia con la tua password MySQL
    database: 'scambio_ricette'
});

// Connetti al database
connection.connect((err) => {
    if (err) {
        console.error('Errore di connessione al database:', err);
        return;
    }
    console.log('Connesso al database MySQL.');
});

module.exports = connection;
