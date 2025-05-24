import { Toaster } from "react-hot-toast"
import AppRouter from "./routes"
import "./styles/App.css"
import { BrowserRouter } from "react-router-dom"

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <AppRouter />
    </BrowserRouter>
  )
}


export default App
