aqr generatekar  const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'employee-data.json');

function ensureDbFile() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(
      dbPath,
      JSON.stringify({ lastId: 0, employees: [], users: [], lastUserId: 0 }, null, 2),
      'utf8'
    );
  }
}

function readDb() {
  ensureDbFile();
  const raw = fs.readFileSync(dbPath, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data.users)) data.users = [];
  if (typeof data.lastUserId !== 'number') data.lastUserId = 0;
  return data;
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

function addUser({ name, email, mobile, passwordHash }) {
  if ((!email && !mobile) || !passwordHash) {
    throw new Error('email or mobile and password are required');
  }
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedMobile = String(mobile || '').trim();

  const data = readDb();
  const exists = data.users.some(
    (u) =>
      (normalizedEmail && u.email === normalizedEmail) ||
      (normalizedMobile && u.mobile === normalizedMobile)
  );
  if (exists) throw new Error('User already exists with this email/mobile');

  const nextId = data.lastUserId + 1;
  const user = {
    id: nextId,
    name: String(name || '').trim(),
    email: normalizedEmail,
    mobile: normalizedMobile,
    passwordHash,
  };
  data.lastUserId = nextId;
  data.users.push(user);
  writeDb(data);
  return Promise.resolve({ id: user.id, name: user.name, email: user.email, mobile: user.mobile });
}


function getUserByIdentifier(identifier) {
  const value = String(identifier || '').trim().toLowerCase();
  if (!value) return Promise.resolve(null);
  const data = readDb();
  const user = data.users.find(
    (u) => (u.email && u.email === value) || (u.mobile && u.mobile.toLowerCase() === value)
  );
  return Promise.resolve(user || null);
}


  addEmployee,
  addUser,
  getUserByIdentifier,
};

