// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
const port = 3002;

app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const pool = mysql.createPool({
  connectionLimit: 10,
  host: '122.51.210.27',
  port: '3306',
  user: '1',
  password: 'cyh991103',
  database: '数据',
});

pool.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('MySQL connected');
  }
});

// CRUD Operations

// Create
app.post('/api/items', (req, res) => {
  const { data } = req.body;
  pool.query('INSERT INTO temp_hum SET ?', data, (err, result) => {
    if (err) throw err;
    res.send('Item added to database');
  });
});


let cachedData = null;

// Function to fetch data from the database
const fetchDataFromDatabase = () => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM temp_hum', (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
// Schedule periodic data update (every 5 seconds in this example)
setInterval(async () => {
  try {
    cachedData = await fetchDataFromDatabase();
    console.log('Data updated');
  } catch (error) {
    console.error('Error updating data', error);
  }
}, 5000);

// Read
app.get('/api/items', (req, res) => {
  if (cachedData) {
    res.send(cachedData);
  } else {
    res.status(500).send('Error fetching data');
  }
});
// Update
app.put('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  pool.query('UPDATE temp_hum SET ? WHERE id = ?', [data, id], (err, result) => {
    if (err) throw err;
    res.send('Item updated');
  });
});

// Delete
app.delete('/api/items/:id', (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM temp_hum WHERE id = ?', id, (err, result) => {
    if (err) throw err;
    res.send('Item deleted');
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
