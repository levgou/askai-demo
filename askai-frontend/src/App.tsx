import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {

  const [textValue, setTextValue] = useState('')

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    console.log('Question: ', textValue)

    const queryResponse = await fetch('http://localhost:3000', {
      method: 'GET',
    })

    const resJson = await queryResponse.json()
    console.log('Answer: ', resJson)
  }


  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <label>
          Question:
          <textarea value={textValue} onChange={e => setTextValue(e.target.value)} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}

export default App;
