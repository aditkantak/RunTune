import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const create = async (bpm, length) => {
  const url = `http://127.0.0.1:8000/create?bpm=${bpm}&length=${length}`;
  try {
    console.log(url)
    const response = await fetch(url);
    if (!response.ok) {
     throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error.message);
  }
}

function App() {
  const [bpm, setBpm] = useState(160);
  const [length, setLength] = useState(15);

  return (
    <>
      <div className="heading">
        <h1>Runtune</h1>
      </div>
      <form className="params">
        <div className='bpm_input'>
          <label>Cadence:</label>
          <input type="number" id="bpm_input" placeholder='What cadence?' 
          min="40" max="220" required
          value={bpm} onChange={(e) => setBpm(e.target.valueAsNumber)}/>
        </div>
        <div className="playlist_length">
          <label>Playlist Length:</label>
          <input type="number" id="length" placeholder='How many songs?' 
          min="10" max="999" required
          value={length} onChange={(e) => setLength(e.target.valueAsNumber)}/>
        </div>
        <div className="generate button">
          <button type = "button" onClick={() => create(bpm, length)}>Generate a playlist!</button>
        </div>
      </form>
      <p>You are requesting a playlist of cadence {bpm} and of length {length}</p>
      <p>The url is /create?bpm={bpm}&length={length}</p>
    </>
  )
}

export default App


// <>
    //   <div>
    //     <a href="https://vite.dev" target="_blank">
    //       <img src={viteLogo} className="logo" alt="Vite logo" />
    //     </a>
    //     <a href="https://react.dev" target="_blank">
    //       <img src={reactLogo} className="logo react" alt="React logo" />
    //     </a>
    //   </div>
    //   <h1>Vite + React</h1>
    //   <div className="card">
    //     <button onClick={() => setCount((count) => count * 2)}>
    //       count is {count}
    //     </button>
    //     <p>
    //       Edit <code>src/App.jsx</code> and save to test HMR
    //     </p>
    //   </div>
    //   <p className="read-the-docs">
    //     Click on the Vite and React logos to learn more
    //   </p>
    // </>
