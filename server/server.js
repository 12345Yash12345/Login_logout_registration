const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const session = require('express-session');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

const db = mysql.createConnection({
  host: 'localhost',
  user: 'Write_username',
  password: 'Write_password',
  database: 'infousers',
  authPlugin: 'Write_pass',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

// endpoint for user registration
app.post('/api/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validate input
    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Check if user already exists with the same email
    const existingUserEmail = await getUserByEmail(email);
    if (existingUserEmail) {
      return res.status(400).json({ message: 'Email is already in use.' });
    }

    // Check if user already exists with the same username
    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
        
      return res.status(400).json({ message: 'Username is already in use.' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    
    db.query('INSERT INTO users (email, username, password) VALUES (?, ?, ?)', [email, username, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error registering user:', err);
        return res.status(500).json({ message: 'Error registering user.' });
      }

      console.log('User registered successfully:', result);
      res.status(201).json({ message: 'User registered successfully.' });
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

// API endpoint for user login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await getUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    // Store user information in the session
    req.session.user = { email, username: user.username };

    res.status(200).json({ message: 'Login successful.' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

// API endpoint for user logout
app.post('/api/logout', (req, res) => {
  try {
    // Destroy the session to log out the user
    req.session.destroy();
    res.status(200).json({ message: 'Logout successful.' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});


async function getUserByEmail(email) {
  return new Promise((resolve) => {
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
      if (err) {
        console.error('Error getting user by email:', err);
        resolve(null);
      } else {
        resolve(rows[0]);
      }
    });
  });
}


async function getUserByUsername(username) {
  return new Promise((resolve) => {
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
      if (err) {
        console.error('Error getting user by username:', err);
        resolve(null);
      } else {
        resolve(rows[0]);
      }
    });
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
