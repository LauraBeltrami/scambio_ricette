-- Crea il database scambio_ricette
CREATE DATABASE IF NOT EXISTS scambio_ricette;

-- Usa il database appena creato
USE scambio_ricette;

-- Nota: Questo database sarà collegato al file db.js
-- Crea una tabella di esempio per le ricette
CREATE TABLE IF NOT EXISTS ricette (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titolo VARCHAR(255) NOT NULL,
    descrizione TEXT NOT NULL,
    autore VARCHAR(100),
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
