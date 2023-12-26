// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
const port = 3002;

app.use(cors());
app.use(bodyParser.json());

// 数据库连接
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
    console.log('数据库已连接');
  }
});

/**
 * 工单的增删读写操作
 */
// 工单创建操作
app.post('/api/work_order/items', (req, res) => {
  const { data } = req.body;
  db.query(`INSERT INTO work_order SET ?`, data, (err, result) => {
    if (err) throw err;
    res.send('工单创建成功');
  });
});

// 读取数据库操作
app.get('/api/work_order/items', (req, res) => {
  if (cachedDataWorkOrder) {
    res.send(cachedDataWorkOrder);
  } else {
    res.status(500).send('获取数据时出错');
  }
});

// 函数从数据库中提取数据
const fetchDataFromDatabase = () => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM work_order`, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// 安排定期数据更新（每1秒一次）
let cachedDataWorkOrder = null;
setInterval(async () => {
  try {
    cachedDataWorkOrder = await fetchDataFromDatabase('work_order');
  } catch (error) {
    console.error('work_order 数据更新失败', error);
  }
}, 1000);

// 数据删除操作
app.delete('/api/work_order/items/:id', (req, res) => {
  const { id } = req.params;
  db.query(`DELETE FROM work_order WHERE id = ?`, id, (err, result) => {
    if (err) throw err;
    res.send('项目已删除');
  });
});

// 数据更新操作
app.put('/api/work_order/items/:id', (req, res) => {
  const { id } = req.params;
  const { data } = req.body;
  db.query(`UPDATE work_order SET ? WHERE id = ?`, [data, id], (err, result) => {
    if (err) throw err;
    res.send('项目已更新');
  });
});

/**
 * 灯具的增删读写操作
 */
// 新灯具添加
app.post('/api/light_data/items', (req, res) => {
  const { data } = req.body;
  db.query(`INSERT INTO light_data SET ?`, data, (err, result) => {
    if (err) throw err;
    res.send('灯具添加成功');
  });
});

app.get('/api/light_data/items', (req, res) => {
  // 获取请求参数中的 project 值
  const projectFilter = req.query.project;
  // 如果指定了 project，则根据 project 进行筛选
  const filteredData = projectFilter ? cachedDataLightData.filter(item => item.project === projectFilter) : cachedDataLightData;
  // 返回筛选后的数据
  res.json(filteredData);
});

// 函数从数据库中提取数据
const fetchDataFromDatabase1 = () => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM light_data`, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// 安排定期数据更新（每1秒一次）
let cachedDataLightData = null;
setInterval(async () => {
  try {
    cachedDataLightData = await fetchDataFromDatabase1();
  } catch (error) {
    console.error('light_data 数据更新失败', error);
  }
}, 1000);

// 数据删除操作
app.delete('/api/light_data/items/:uuid', (req, res) => {
  const { uuid } = req.params;
  db.query(`DELETE FROM light_data WHERE uuid = ?`, uuid, (err, result) => {
    if (err) throw err;
    res.send('灯具已删除');
  });
});

// 数据更新操作
app.put('/api/light_data/items/:uuid', (req, res) => {
  const { uuid } = req.params;
  const { data } = req.body;
  db.query(`UPDATE light_data SET ? WHERE uuid = ?`, [data, uuid], (err, result) => {
    if (err) throw err;
    res.send('灯具已更新');
  });
});


// 服务器监听端口
app.listen(port, () => {
  console.log(`服务器正在端口${port}上运行`);
});
