import './App.css'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Layout from './components/shared/Layout';

import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/layout" element={<Layout />}>
          <Route index element={<Dashboard />}></Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
