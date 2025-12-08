import { Route, Routes, useLocation } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Registr"
import Documents from "./pages/Documents"
import Employees from "./pages/Employees"
import Header from "./components/features/Header/header"

function App() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="flex min-h-screen bg-background">
      {!isAuthPage && <Header />}
      <main className={!isAuthPage ? "flex-1 ml-[300px]" : "flex-1"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/employees" element={<Employees />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
