import './App.css';
import Home from './pages/Home';
import { useEffect } from 'react';

const VERSION = '1.0.6';
const SERVER_URL = 'http://localhost:5000';

function App() {
  useEffect(() => {
    if (document.cookie) {
      console.log(document.cookie);
      if (document.cookie.includes('null')) {
        var array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        document.cookie = `token=${array.toString()}`;
      }
      return;
    }

    var array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    document.cookie = `token=${array.toString()}`;
  }, []);

  return (
    <div className="App">
      <Home version={VERSION} serverUrl={SERVER_URL} />
    </div>
  );
}

export default App;
