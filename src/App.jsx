import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./Login"
import Dashboard from "./Dashboard"
import Cases from "./Cases"
import Hearings from "./Hearings"
import CaseDetail from "./CaseDetail"
import AddCase from "./Addcase"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/cases/add" element={<AddCase />} />
        <Route path="/cases/:id" element={<CaseDetail />} />
        <Route path="/hearings" element={<Hearings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App