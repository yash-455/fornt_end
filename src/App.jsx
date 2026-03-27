import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Landing from "./Landing"
import Login from "./Login"
import Register from "./Register"
import ForgotPassword from "./ForgotPassword"
import Dashboard from "./Dashboard"
import Cases from "./Cases"
import Hearings from "./Hearings"
import CaseDetail from "./CaseDetail"
import AddCase from "./Addcase"
import EditCase from "./Editcase"
import ScheduleHearing from "./Schedulehearing"
import Documents from "./Documents"
import AddDocument from "./Adddocument"
import Assistant from "./Assistant"
import Clients from "./Clients"
import AddClient from "./AddClient"
import EditClient from "./EditClient" 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Intro page is now the first thing the user sees */}
        <Route path="/" element={<Landing />} /> 
        <Route path="/login" element={<Login />} /> 
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/cases/add" element={<AddCase />} />
        <Route path="/cases/edit/:id" element={<EditCase />} />
        <Route path="/cases/:id" element={<CaseDetail />} />
        <Route path="/hearings" element={<Hearings />} />
        <Route path="/hearings/schedule" element={<ScheduleHearing />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/documents/adddocument" element={<AddDocument />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/clients/add" element={<AddClient />} />
        <Route path="/clients/edit/:id" element={<EditClient />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App