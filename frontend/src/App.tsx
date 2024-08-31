import { useState } from 'react'
import './App.css'
import Sheet from './components/Sheet'
import exampleData from './example_data'

function App() {
  const [read, setRead] = useState(false)

  return (
    <div style={{ height: "100vh" }}>
      <button onClick={() => setRead(!read)}>toggle mode</button>
      <Sheet
        height="80%"
        data={exampleData}
        options={
          read && {
            mode: "read",
            showToolbar: false,
            showGrid: false,
            showContextmenu: false
          }
        }
      />
      <br />
    </div>
  );
}

export default App
