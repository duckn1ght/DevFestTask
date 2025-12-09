import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Registr"
import Documents from "./pages/Documents"
import Employees from "./pages/Employees"
import Header from "./components/features/Header/header"
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute"
import { useAuth } from "./context/AuthContext"

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen bg-background flex-col lg:flex-row">
      {isAuthenticated && <Header />}
      <main className={isAuthenticated ? "flex-1 lg:ml-[300px] w-full pt-16 lg:pt-0" : "flex-1 w-full"}>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/employees" element={<Employees />} />
          </Route>
        </Routes>
      </main>
    </div>
  )
}

export default App
