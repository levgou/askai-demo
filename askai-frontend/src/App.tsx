import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';


const ResPart = ({ content, confidence }: { content: string, confidence: number }) => {
  return (
    <div>
      <div>
        {content}
      </div>
      <div>
        {confidence}
      </div>
    </div>
  )

}

interface ResItem { content: string, confidence: number }


function App() {

  const [textValue, setTextValue] = useState('')
  const [res, setRes] = useState<ResItem[]>([])

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    console.log('Question: ', textValue)

    const queryResponse = await fetch(`http://localhost:3000/${textValue}`, {
      method: 'GET',
    })

    const resJson = await queryResponse.json() as ResItem[]
    console.log('Answer: ', resJson)
    setRes(resJson)
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

      {res.map(r => <ResPart key={r.confidence} content={r.content} confidence={r.confidence} />)}
    </div>
  )
}




export default App;
