const express = require('express');
const crypto = require('crypto');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('apikeys.db');


const app = express();



app.get('/generateApiKey', (req, res) => {
  const apiKey = crypto.randomBytes(32).toString('hex');
  const query = `INSERT INTO apikeys (key, used) VALUES ('${apiKey}', 0)`;
  db.run(query);

  res.send(apiKey);
});

app.get('/protectedResource', (req, res) => {
  const providedApiKey = req.query.apiKey;
  const query = `SELECT * FROM apikeys WHERE key = '${providedApiKey}' AND used = 0`;
  db.get(query, (err, row) => {
    if (row) {
      const updateQuery = `UPDATE apikeys SET used = 1 WHERE key = '${providedApiKey}'`;
      db.run(updateQuery);
            // Ruta al archivo PDF
      const filePath = path.join(__dirname, 'sample.pdf');
      // Envía el archivo PDF como respuesta
      res.sendFile(filePath);
    } else {
      res.status(401).send('API key inválida. Acceso denegado.');
    }
  });

});

app.use(express.static(__dirname));
app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});