import logo from './logo.svg';
import './App.css';
import Home from './pages/Home';
import { useEffect } from 'react';

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
      <Home />
    </div>
  );
}

export default App;
