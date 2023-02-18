import { useState } from 'react';
import FirebaseAuthService from './FirebaseAuthService';
import LoginForm from './Components/LoginForm';

import logo from './logo.svg';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  FirebaseAuthService.subscribeToAuthChanges(setUser);

  return (
    <div className="App">
      <header className="App-header">
        <div className='App-header-branding'>
          <img src={logo} className="App-logo" alt="logo" />
          <p>QRX Lookup!</p>
        </div>
        <div className='App-header-login'>
          <LoginForm existingUser={user}></LoginForm>
        </div>
      </header>
    </div>
  );
}

export default App;
