import { Toaster } from "sonner"
import AppRouter from "./routes"
import "./styles/App.css"
import { BrowserRouter } from "react-router-dom"

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-center" />
      <AppRouter />
    </BrowserRouter>
  )
}


export default App
