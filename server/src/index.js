const express = require("express");
const cron = require("node-cron");
const { connectDatabase, registryTable, dataTable, registerDevice, getDevices, insertData } = require("./sqlite.js");
const grabData = require("./data_grabber.js");
const fs = require("fs");

const db = connectDatabase("data.db");

registryTable(db, "registered_devices");

const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  cron.schedule("*/1 * * * *", async () => {
    console.log("Cron job running")
    const devices = await getDevices(db, "registered_devices");
    devices.forEach(async (device) => {
      console.log(`Grabbing data from ${device.name}`);
      try {
        const data = JSON.parse(await grabData(device.ip));

        if (data) {
          insertData(db, device.name, data);
        }
      } catch (err) {
        console.error(`Error grabbing data from ${device.name}: ${err.message}`);
      }
    });
  });
});

app.get('/device/:name', async (req, res) => {
  const name = req.params.name;
  console.log(`Getting data for device ${name}`)
  const data = await getDevices(db, name);
  if (!data) {
    res.status(404).send("Device not found or it has no data yet.");
    return
  }
  let tableData = '<table><tr><th>Timestamp</th><th>Temperature</th><th>Humidity</th></tr>';
  data.forEach(row => {
    let date = new Date(Number(row.timestamp));
    tableData += `<tr><td>${date.toLocaleString()}</td><td>${row.temperature}&deg;C</td><td>${row.humidity}%</td></tr>`;
  });
  tableData += '</table>';

  const filePath = './public/data.html';
  let html = fs.readFileSync(filePath, 'utf8');
  html = html.replace(/{{deviceName}}/g, name);
  html = html.replace('{{tableData}}', tableData);

  res.send(html);
});

app.post('/register', (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const data = JSON.parse(body);
    registerDevice(db, "registered_devices", data.name, data.ip);
    dataTable(db, data.name);
    console.log(`Registered device ${data.name} with IP ${data.ip}`);
    res.status(200).send(`Device: ${data.name} registered`);
  });
});

app.get('/', (req, res) => {
  let sql = `SELECT name, ip FROM registered_devices`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.end(JSON.stringify(rows));
  });
});