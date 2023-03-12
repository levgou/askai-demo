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

  const [textValue, setTextValue] = useState('What should I eat for breakfast?')
  const [res, setRes] = useState<ResItem[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    console.log('Question: ', textValue)
    setRes([])
    setLoading(true)

    const queryResponse = await fetch(`http://localhost:3000/${textValue}`, {
      method: 'GET',
    })

    const resJson = await queryResponse.json() as ResItem[]
    console.log('Answer: ', resJson)
    setLoading(false)
    setRes(resJson)
  }


  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <div className="formd" id='formd'>
          <label>
            Question:
          </label>
          <textarea
            value={textValue}
            onChange={e => setTextValue(e.target.value)}
            style={{ marginLeft: 10, marginRight: 20, width: 300 }}
          />
          <input type="submit" value="Submit" />
        </div>
      </form>

      <div id='spinner'>
        {loading && <div className="loader" />}
      </div>

      {res.map(r => <ResPart key={r.confidence} content={r.content} confidence={r.confidence} />)}
    </div>
  )
}

export default App;
