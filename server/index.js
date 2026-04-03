bhai tu in dono ko const http = require('http');
const { handleApiRequest } = require('../api');
const PORT = process.env.PORT || 3000;

const shoppingPageHtml = `<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ARUU2040x Shopping - Employee App</title>
<style>
body{font-family:system-ui,sans-serif;margin:0;padding:16px;background:#f5f5f5;max-width:480px;margin:auto}
header{background:#4f46e5;color:white;padding:16px;text-align:center}
h1{margin:0;font-size:1.4em}
nav{padding:8px;background:white;margin-bottom:16px;border-radius:8px}
nav button{background:#10b981;color:white;border:none;padding:8px 16px;border-radius:4px;margin:0 4px;cursor:pointer;font-size:16px}
.product-grid{display:grid;gap:16px}
.product{background:white;padding:16px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
.product img{width:100%;height:160px;object-fit:cover;border-radius:8px}
.price{font-size:1.2em;font-weight:bold;color:#059669}
.add-cart{background:#ef4444;color:white;border:none;padding:12px;width:100%;border-radius:8px;font-size:16px;cursor:pointer}
#cart{background:white;padding:20px;border-radius:12px;margin-top:16px}
#ai-chat, #msg{padding:16px;background:#f8fafc;border-radius:8px;margin-top:16px}
input,select{width:100%;padding:12px;margin:8px 0;box-sizing:border-box;border:1px solid #d1d5db;border-radius:6px;font-size:16px}
@media (max-width:480px){body{padding:8px}}
</style>
</head>
<body>
<header>
<h1>🛒 ARUU2040x Shopping</h1>
<p>Electronics | Fashion | Home | AI Help</p>
</header>
<nav>
<button onclick="loadProducts()">Products</button>
<button onclick="viewCart()">Cart (<span id="cartCount">0</span>)</button>
<button onclick="openEmployees()">👥 Employees</button>
<button onclick="openLogin()">Login</button>
</nav>
<div id="content">
<div class="product-grid" id="products"></div>
</div>
<div id="cart" style="display:none">
<h2>🛒 Cart</h2>
<div id="cartItems"></div>
<button onclick="checkout()" style="background:#3b82f6">Checkout Rs. <span id="total">0</span></button>
</div>
<div id="ai-chat">
<h3>🤖 AI Helper</h3>
<input id="aiInput" placeholder="Ask about products...">
<button onclick="aiRespond()">Send</button>
<p id="aiMsg">Hi! What electronics/fashion/home items you like?</p>
</div>
<p id="msg"></p>
<script>
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let authToken = localStorage.getItem('authToken') || '';

function updateCartCount() {
  document.getElementById('cartCount').textContent = cart.length;
}


  fetch('/api/products')
    .then(r => r.json())
    .then(products => {

          <img src="${p.image || 'https://via.placeholder.com/300x160?text='+p.name+'"} alt="${p.name}">
          <h3>${p.name}</h3>
          <p>${p.desc}</p>
          <div class="price">Rs. ${p.price}</div>
          <button class="add-cart" onclick="addToCart(${p.id})">Add to Cart</button>
        </div>
      `).join('');
    }).catch(err => document.getElementById('msg').textContent = err.message);
  document.getElementById('cart').style.display = 'none';
}

function addToCart(id) {
  cart.push({id, qty:1});
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  document.getElementById('msg').textContent = 'Added to cart!';
}

function viewCart() {
  const items = {};
  cart.forEach(item => items[item.id] = (items[item.id]||0) + 1);
  fetch('/api/products')
    .then(r => r.json())
    .then(products => {
      const cartItems = Object.entries(items).map(([idStr, qty]) => {
        const p = products.find(p => p.id == idStr);
        return p ? `<div>${p.name} x${qty} = Rs.${p.price * qty}</div>` : '';
      }).join('');
      document.getElementById('cartItems').innerHTML = cartItems;
      document.getElementById('total').textContent = Object.entries(items).reduce((sum, [idStr, qty]) => {
        const p = products.find(p => p.id == idStr);
        return sum + (p ? p.price * qty : 0);
      }, 0);
      document.getElementById('cart').style.display = 'block';
      document.getElementById('products').innerHTML = '';
    });
}

function checkout() {
  document.getElementById('msg').textContent = 'Order placed! Total saved to local. (Demo)';
  cart = [];
  localStorage.setItem('cart', '[]');
  updateCartCount();
}

function aiRespond() {
  const input = document.getElementById('aiInput').value;
  document.getElementById('aiMsg').textContent = `AI: Electronics me iPhone best hai. Fashion me sneakers. Search karo! (Mock)`;
  document.getElementById('aiInput').value = '';
}

function openEmployees() {
  window.location.href = '/form';
}

function openLogin() {
  // Login form toggle or /form#login
  document.getElementById('msg').textContent = 'Login at /form (admin/admin123)';
}

loadProducts();
updateCartCount();
</script>
</body>
</html>`;
const formPageHtml = `<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Employee add</title>
<style>
body{font-family:system-ui,sans-serif;max-width:420px;margin:24px auto;padding:0 16px}
label{display:block;margin:12px 0 4px}
input{width:100%;padding:10px;box-sizing:border-box;font-size:16px}
button{margin-top:16px;width:100%;padding:12px;font-size:16px}
#msg{margin-top:12px;white-space:pre-wrap;word-break:break-word}
a{display:inline-block;margin-top:16px}
</style>
</head>
<body>
<h1>Employee add</h1>
<p>Default login: <b>admin</b> / <b>admin123</b></p>
<h2>Sign up</h2>
<form id="signupForm">
<label>Name<input name="name" placeholder="Your name"></label>
<label>Email<input name="email" type="email" placeholder="you@gmail.com"></label>
<label>Mobile<input name="mobile" placeholder="98xxxxxxxx"></label>
<label>Password<input name="password" type="password" required></label>
<button type="submit">Send Signup OTP</button>
</form>
<form id="signupVerifyForm">
<label>Email/Mobile<input name="target" required placeholder="same email/mobile"></label>
<label>Signup OTP<input name="otp" required placeholder="6 digit otp"></label>
<button type="submit">Verify Signup OTP</button>
</form>
<form id="loginForm">
<label>Username (email/mobile/admin)<input name="username" required value="admin"></label>
<label>Password<input name="password" type="password" required value="admin123"></label>
<button type="submit">Sign in</button>
</form>
<hr>
<h2>OTP login</h2>
<form id="otpRequestForm">
<label>Mobile or Email<input name="target" required placeholder="98xxxxxxxx or you@gmail.com"></label>
<label>Channel<input name="channel" required value="sms" placeholder="sms or email"></label>
<button type="submit">Request OTP</button>
</form>
<form id="otpVerifyForm">
<label>Same target<input name="target" required placeholder="same as above"></label>
<label>OTP<input name="otp" required placeholder="6 digit otp"></label>
<button type="submit">Verify OTP Login</button>
</form>
<p style="font-size:12px">Note: demo mode me OTP screen par show hoga.</p>
<form id="f">
<label>Name<input name="name" required autocomplete="name"></label>
<label>Role<input name="role" required></label>
<label>Salary<input name="salary" type="number" required min="0"></label>
<button type="submit">Save</button>
</form>
<p id="msg"></p>
<button id="listBtn" type="button">View list (JSON)</button>
<pre id="list"></pre>
<script>
let authToken = '';

document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('msg');
  msg.textContent = 'Sending signup OTP...';
  const body = {
    name: signupForm.name.value.trim(),
    email: signupForm.email.value.trim(),
    mobile: signupForm.mobile.value.trim(),
    password: signupForm.password.value
  };
  try {
    const r = await fetch('/api/auth/signup/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Signup OTP failed');
    signupVerifyForm.target.value = data.target || body.email || body.mobile;
    msg.textContent = data.otp ? ('Signup OTP: ' + data.otp + ' (demo mode)') : 'Signup OTP sent';
  } catch (err) {
    msg.textContent = err.message;
  }
});

document.getElementById('signupVerifyForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('msg');
  msg.textContent = 'Verifying signup OTP...';
  const body = {
    target: signupVerifyForm.target.value.trim(),
    otp: signupVerifyForm.otp.value.trim()
  };
  try {
    const r = await fetch('/api/auth/signup/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Signup verify failed');
    msg.textContent = 'Signup success. Ab Sign in karo.';
    loginForm.username.value = data.user.email || data.user.mobile || '';
    loginForm.password.value = '';
    signupForm.password.value = '';
    signupVerifyForm.otp.value = '';
  } catch (err) {
    msg.textContent = err.message;
  }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('msg');
  msg.textContent = 'Logging in...';
  const body = {
    username: loginForm.username.value.trim(),
    password: loginForm.password.value
  };
  try {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Login failed');
    authToken = data.token;
    msg.textContent = 'Login success';
  } catch (err) {
    msg.textContent = err.message;
  }
});

document.getElementById('otpRequestForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('msg');
  msg.textContent = 'Requesting OTP...';
  const body = {
    target: otpRequestForm.target.value.trim(),
    channel: otpRequestForm.channel.value.trim().toLowerCase()
  };
  try {
    const r = await fetch('/api/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'OTP request failed');
    msg.textContent = 'OTP: ' + data.otp + ' (demo mode)';
    otpVerifyForm.target.value = body.target;
  } catch (err) {
    msg.textContent = err.message;
  }
});

document.getElementById('otpVerifyForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('msg');
  msg.textContent = 'Verifying OTP...';
  const body = {
    target: otpVerifyForm.target.value.trim(),
    otp: otpVerifyForm.otp.value.trim()
  };
  try {
    const r = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'OTP verify failed');
    authToken = data.token;
    msg.textContent = 'OTP login success';
  } catch (err) {
    msg.textContent = err.message;
  }
});

document.getElementById('f').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('msg');
  if (!authToken) {
    msg.textContent = 'Please login first';
    return;
  }
  msg.textContent = 'Saving...';
  const body = {
    name: f.name.value.trim(),
    role: f.role.value.trim(),
    salary: Number(f.salary.value)
  };
  try {
    const r = await fetch('/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + authToken
      },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Error');
    msg.textContent = 'Saved: ' + JSON.stringify(data);
    f.reset();
  } catch (err) {
    msg.textContent = err.message;
  }
});

document.getElementById('listBtn').addEventListener('click', async () => {
  const list = document.getElementById('list');
  if (!authToken) {
    list.textContent = 'Please login first';
    return;
  }
  list.textContent = 'Loading...';
  try {
    const r = await fetch('/api/employees', {
      headers: { 'Authorization': 'Bearer ' + authToken }
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Error');
    list.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    list.textContent = err.message;
  }
});
</script>
</body>
</html>`;

const server = http.createServer(async (req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(shoppingPageHtml);
    return;
  }

  if (req.url === '/form' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(formPageHtml);
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  await handleApiRequest(req, res);
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

