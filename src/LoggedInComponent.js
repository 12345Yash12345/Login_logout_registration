import React from 'react';

const LoggedInComponent = ({ onLogout }) => {
  return (
    <div>
      <p>Welcome!!!!</p>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
};

export default LoggedInComponent;
