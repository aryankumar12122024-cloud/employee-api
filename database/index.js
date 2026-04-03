const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'employee-data.json');

function ensureDbFile() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ lastId: 0, employees: [] }, null, 2), 'utf8');
  }
}

function readDb() {
  ensureDbFile();
  const raw = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(raw);
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

function getEmployees() {
  const data = readDb();
  return Promise.resolve(data.employees);
}

function addEmployee({ name, role, salary }) {
  if (!name || !role || salary === undefined) {
    throw new Error('name, role and salary are required');
  }

  const data = readDb();
  const nextId = data.lastId + 1;
  const employee = { id: nextId, name, role, salary: Number(salary) };
  data.lastId = nextId;
  data.employees.push(employee);
  writeDb(data);
  return Promise.resolve(employee);
}

module.exports = {
  getEmployees,
  addEmployee,
};

