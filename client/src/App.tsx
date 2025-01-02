import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './components/Home'
import Register from './components/Register'
import Login from './components/Login'
import PlayerCreation from './components/PlayerCreation'

// Main app component
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true'
  })
  const [user, setUser] = useState(() => {
    return {
      username: localStorage.getItem('username') || '',
      id: localStorage.getItem('userId') || '',
      apiKey: localStorage.getItem('apiKey') || '',
      vectorStoreId: localStorage.getItem('vectorStoreId') || '',
      assistantId: localStorage.getItem('assistantId') || '',
      player: localStorage.getItem('player') || ''
    }
  })

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString())
    localStorage.setItem('username', user.username)
    localStorage.setItem('userId', user.id)
    localStorage.setItem('apiKey', user.apiKey)
    localStorage.setItem('vectorStoreId', user.vectorStoreId)
    localStorage.setItem('assistantId', user.assistantId)
    localStorage.setItem('player', user.player)
  }, [isLoggedIn, user])

  return (
    <Router>
      <Routes>
        <Route 
          path="/home" 
          element={
            isLoggedIn ? (
              <Home isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route path="/register" element={
          isLoggedIn ? (
            <Navigate to="/home" replace />
          ) : (
            <Register setUser={setUser} />
          )
        } />
        <Route path="/login" element={
          isLoggedIn ? (
            <Navigate to="/home" replace />
          ) : (
            <Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
          )
        } />
        <Route path="/create-player" element={<PlayerCreation setUser={setUser} user={user} setIsLoggedIn={setIsLoggedIn}/>}/>
        <Route path="*" element={
          isLoggedIn ? (
            <Navigate to="/home" replace />
          ) : (
            <Navigate to="/register" replace />
          )
        } />
      </Routes>
    </Router>
  )
}

export default App
