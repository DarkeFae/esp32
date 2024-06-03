const sqlite3 = require('sqlite3').verbose();

function connectDatabase(db) {
	const dbHandle = new sqlite3.Database(`${db}.db`, (err) => {
		if (err) {
		  console.error(err.message);
		}
		console.log('Connected to the database.');
	  });
	
	  // Check for the existence of the 'registry' table
	  dbHandle.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='registered_devices';`, (err, row) => {
		if (err) {
		  console.error(err.message);
		}
		if (!row) {
		  console.log('The "registry" table does not exist.');
		  // You can call regitryTable(dbHandle, 'registry') here to create the table
		}
	  });
	
	  return dbHandle;
}

function registryTable(db, table, columns) {
  db.serialize(() => {
	db.run(`CREATE TABLE IF NOT EXISTS ${table} (id INTEGER PRIMARY KEY, name TEXT UNIQUE, ip TEXT)`);
  });
}

function dataTable(db, table) {
  db.serialize(() => {
	db.run(`CREATE TABLE IF NOT EXISTS ${table} (id INTEGER PRIMARY KEY, timestamp TEXT, temperature REAL, humidity REAL)`);
  });
}

function registerDevice(db, table, name, ip) {
  db.serialize(() => {
	const stmt = db.prepare(`INSERT OR REPLACE INTO ${table} (name, ip) VALUES (?, ?)`);
	stmt.run(name, ip);
	stmt.finalize();
  });
}

function getDevices(db, table) {
  return new Promise((resolve, reject) => {
	db.all(`SELECT * FROM ${table}`, (err, rows) => {
	  if (err) {
		reject(err);
	  }
	  resolve(rows);
	});
  });
}

function insertData(db, table, data) {
  db.serialize(() => {
	const stmt = db.prepare(`INSERT INTO ${table} (timestamp, temperature, humidity) VALUES (?, ?, ?)`);
	var now = new Date();
	console.log(data);
	stmt.run(now, data.temperature, data.humidity);
	stmt.finalize();
  });
}


module.exports = { connectDatabase, registryTable, dataTable, registerDevice, getDevices, insertData };