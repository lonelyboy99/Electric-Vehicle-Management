// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
const port = 3002;

// Define table name as a constant
const TABLE_NAME = 'work_order';

app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  max_connections: 1000,
  host: '122.51.210.27',
  port: '3306',
  user: '1',
  password: 'cyh991103',
  database: '数据',
});

db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('MySQL数据库已连接');
  }
});

// CRUD Operations

// Create
app.post('/api/items', (req, res) => {
  const { data } = req.body;
  db.query(`INSERT INTO ${TABLE_NAME} SET ?`, data, (err, result) => {
    if (err) throw err;
    res.send('工单创建成功');
  });
});

// Function to fetch data from the database
const fetchDataFromDatabase = () => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM ${TABLE_NAME}`, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// Schedule periodic data update (every 5 seconds in this example)
let cachedData = null;
setInterval(async () => {
  try {
    cachedData = await fetchDataFromDatabase();
  } catch (error) {
    console.error('Error updating data', error);
  }
}, 1000);

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
  db.query(`UPDATE ${TABLE_NAME} SET ? WHERE id = ?`, [data, id], (err, result) => {
    if (err) throw err;
    res.send('Item updated');
  });
});

// Delete
app.delete('/api/items/:id', (req, res) => {
  const { id } = req.params;
  db.query(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, id, (err, result) => {
    if (err) throw err;
    res.send('Item deleted');
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
