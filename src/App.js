import logo from './logo.svg';
import './App.css';
// eslint-disable-next-line
import firebase from './FirebaseConfig';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>QRX Lookup!</p>
      </header>
    </div>
  );
}

export default App;
