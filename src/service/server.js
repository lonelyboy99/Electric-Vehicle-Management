// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
const port = 8026;

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
  const {data} = req.body;
  db.query(`INSERT INTO work_order SET ?`, data, (err, result) => {
    if (err) throw err;
    res.send('工单创建成功');
  });
});
app.get('/api/work_order/check/:notes/:state', (req, res) => {
  const { notes, state } = req.params;

  db.query(
    `SELECT * FROM work_order WHERE notes = ? AND state != ?`,
    [notes, '已完成'],  // 不包含已完成状态的工单
    (err, result) => {
      if (err) {
        console.error('查询工单时出错', err);
        res.status(500).json({ error: '查询工单时出错' });
      } else {
        res.status(200).json({ exists: result.length > 0 });
      }
    }
  );
});
app.get('/api/work_order/items', (req, res) => {
  const customerFilter = req.query.customer;
  const stateFilter = req.query.state;
  const typeFilter = req.query.type; // 从查询参数中获取地址过滤器

  let filteredData = cachedDataWorkOrder;

  if (customerFilter) {
    filteredData = filteredData.filter(item => item.customer === customerFilter);
  }
  if (stateFilter) {
    filteredData = filteredData.filter(item => item.state === stateFilter);
  }
  if (typeFilter) {
    filteredData = filteredData.filter(item => item.type === typeFilter);
  }

  res.json(filteredData);
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
  const {id} = req.params;
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
    if (err) {
      console.error('Error updating item in the database', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send('项目已更新');
    }
  });
});

// 安排定期数据更新（每1秒一次）
let cachedDataLightData = null;
setInterval(async () => {
  try {
    cachedDataLightData = await fetchDataFromDatabase1();
  } catch (error) {
    console.error('light_data 数据更新失败', error);
  }
}, 1000);

/**
 * 灯具的增删读写操作
 */
// 新灯具添加
app.post('/api/light_data/items', (req, res) => {
  const {data} = req.body;
  db.query(`INSERT INTO light_data SET ?`, data, (err, result) => {
    if (err) throw err;
    res.send('灯具添加成功');
  });
});

app.get('/api/light_data/items', (req, res) => {
  const projectFilter = req.query.project;
  const addressFilter = req.query.address; // 从查询参数中获取地址过滤器

  let filteredData = cachedDataLightData;

  if (projectFilter) {
    filteredData = filteredData.filter(item => item.project === projectFilter);
  }

  if (addressFilter) {
    filteredData = filteredData.filter(item => item.address === addressFilter);
  }

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



// 数据删除操作
app.delete('/api/light_data/items/:uuid', (req, res) => {
  const {uuid} = req.params;
  db.query(`DELETE FROM light_data WHERE uuid = ?`, uuid, (err, result) => {
    if (err) throw err;
    res.send('灯具已删除');
  });
});

// 处理更新灯具信息的请求
app.put('/api/light_data/items/:device_name?/:area?/:cluster?/:number?', (req, res) => {
  try {
    const {device_name, area, cluster, number} = req.params;
    const updatePayload = req.body.data;
    const listName = req.body.listName; // 新增这一行获取 updateField 参数

    // 构建基本的 SQL 查询
    let updateQuery = `UPDATE light_data SET ${listName} = ?`; // 使用动态字段

    // 构建 WHERE 子句，仅包含有值的参数
    const whereClauses = [];
    if (device_name !== undefined && device_name !== 'NA') whereClauses.push('device_name = ?');
    if (area !== undefined && area !== 'NA') whereClauses.push('area = ?');
    if (cluster !== undefined && cluster !== 'NA') whereClauses.push('cluster = ?');
    if (number !== undefined && number !== 'NA') whereClauses.push('number = ?');

    if (whereClauses.length > 0) {
      updateQuery += ' WHERE ' + whereClauses.join(' AND ');
    }
    // 执行数据库更新操作
    const queryParams = [
      updatePayload[listName] // 使用动态字段
    ];
    if (device_name !== 'NA') {
      queryParams.push(device_name);
    }
    if (area !== 'NA') {
      queryParams.push(area);
    }
    // 只在cluster和number的值不为"NA"时添加到参数数组中
    if (cluster !== 'NA') {
      queryParams.push(cluster);
    }

    if (number !== 'NA') {
      queryParams.push(number);
    }

    // console.log('完整的 SQL 查询:', updateQuery);
    // console.log('SQL 查询参数:', queryParams);

    db.query(updateQuery, queryParams, (err, updateResult) => {
      if (err) {
        console.error('数据库查询时出错', err);
        res.status(500).json({error: '数据库查询时出错'});
      } else {
        res.status(200).json({message: '更新成功', affectedRows: updateResult.affectedRows});
      }
    });
  } catch (error) {
    console.error('更新数据时出错', error);
    res.status(500).json({error: '更新数据时出错'});
  }
});

app.post('/api/light_data/search', (req, res) => {
  try {
    const { area, cluster, number } = req.body;

    // 构建基本的 SQL 查询
    let selectQuery = 'SELECT * FROM light_data WHERE 1';

    // 构建 WHERE 子句，仅包含有值的参数
    const whereClauses = [];
    if (area) whereClauses.push('area = ?');
    if (cluster) whereClauses.push('cluster = ?');
    if (number) whereClauses.push('number = ?');

    if (whereClauses.length > 0) {
      selectQuery += ' AND ' + whereClauses.join(' AND ');
    }

    // 执行数据库查询操作
    const queryParams = [];
    if (area) {
      queryParams.push(area);
    }
    if (cluster) {
      queryParams.push(cluster);
    }
    if (number) {
      queryParams.push(number);
    }

    // console.log('完整的 SQL 查询:', selectQuery);
    // console.log('SQL 查询参数:', queryParams);

    db.query(selectQuery, queryParams, (err, result) => {
      if (err) {
        console.error('数据库查询时出错', err);
        res.status(500).json({ error: '数据库查询时出错' });
      } else {
        res.status(200).json(result);
      }
    });
  } catch (error) {
    console.error('查询数据时出错', error);
    res.status(500).json({ error: '查询数据时出错' });
  }
});
/**
 * 能耗数据获取
 */
// 新增一个端点用于获取能耗数据
app.get('/api/power/items', (req, res) => {
  const { startDate, endDate } = req.query;

  // 构建查询语句
  let query = 'SELECT up_timestamp, power FROM power';
  const queryParams = [];

  // 如果有提供起始和结束日期，添加日期范围的条件
  if (startDate && endDate) {
    query += ' WHERE up_timestamp >= ? AND up_timestamp <= ?';
    queryParams.push(startDate, endDate);
  }

  // 执行数据库查询操作
  db.query(query, queryParams, (err, result) => {
    if (err) {
      console.error('查询能耗数据时出错', err);
      res.status(500).json({ error: '查询能耗数据时出错' });
    } else {
      res.status(200).json(result);
    }
  });
});
// 服务器监听端口
app.listen(port, () => {
  console.log(`服务器正在端口${port}上运行`);
});
