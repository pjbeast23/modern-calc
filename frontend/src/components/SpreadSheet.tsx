import Sheet from './Sheet'
import { useParams } from 'react-router-dom'
import React from 'react'
import axios from 'axios'

// type Props = {
//     data : JSON,
// }

export default function SpreadSheet() {
    const [read, setRead] = React.useState(false)
    const params = useParams()
    const sheetId = params.id
    const data = axios.get(`http://localhost:3000/worksheets/${sheetId}`)
  return (
    <div style={{height:"100vh"}}>
        <button onClick={() => setRead(!read)}>toggle mode</button>
        <Sheet
        height="80%"
        data={data}
        options={
          read && {
            mode: "read",
            showToolbar: false,
            showGrid: false,
            showContextmenu: false
          }
        }
      />
    </div>
  )
}