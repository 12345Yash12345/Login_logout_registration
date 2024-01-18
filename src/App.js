import React, { useState, useEffect } from 'react';
import LoggedInComponent from './LoggedInComponent';
import './App.css'; 

const App = ({ onRegistrationSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });

  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    if (isRegistered) {
      const timer = setTimeout(() => {
        setIsRegistered(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isRegistered]);

  useEffect(() => {
    
    setFormData({
      email: '',
      username: '',
      password: '',
    });
  }, [showLogin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, username, password } = formData;

   
    if (!email || !password) {
      console.error('Please provide both email and password.');
      return;
    }

    try {
      const apiUrl = showLogin ? 'http://localhost:3001/api/login' : 'http://localhost:3001/api/register';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(showLogin ? 'Login successful:' : 'User registered successfully:', result);

        if (!showLogin) {
          setIsRegistered(true);
          if (onRegistrationSuccess) {
            onRegistrationSuccess();
          }

          setFormData({
            email: '',
            username: '',
            password: '',
          });
        }

        if (showLogin) {
          setIsLoggedIn(true);
        }

      } else {
        console.error('Error:', response.statusText  );
        if (response.status === 400) {
          alert('User already exists. Please use a different email or username.');
          setFormData({
            email: '',
            username: '',
            password: '',
          });
        } else {
          alert('An error occurred. Please try again later.');
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
      
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setFormData({
      email: '',
      username: '',
      password: '',
    });
    console.log('Logout successful'); 
  };

  return (
    <div className="app-container">
      {isLoggedIn ? (
        <LoggedInComponent  onLogout={handleLogout} />
      ) : (
        <div className="login-container">
          {isRegistered ? (
            <div className="success-message">
              <p>Registration successful! You can now log in.</p>
            </div>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              {!showLogin && (
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button className="submit-button" type="submit">
                {showLogin ? 'Login' : 'Register'}
              </button>
            </form>
          )}

          {!isRegistered && !isLoggedIn && (
            <div className="toggle-message">
              <p>
                {showLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <span className="toggle-link" onClick={() => setShowLogin(!showLogin)}>
                  {showLogin ? 'Register here.' : 'Login here.'}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
