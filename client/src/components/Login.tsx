import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import '../style/Login.css'

interface LoginProps {
  setIsLoggedIn: (value: boolean) => void;
  setUser: (value: {
    username: string;
    id: string;
    apiKey: string;
    vectorStoreId: string;
    assistantId: string;
    player: string
  }) => void;
}   

function Login({ setIsLoggedIn, setUser }: LoginProps) {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const response = await fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        const data = await response.json()
        console.log('Login submitted:', formData)
        console.log('Response:', data)

        if (data.error) {
            console.error('Error:', data.error)
            alert(data.error)
        } else {
            setIsLoggedIn(true)
            setUser({
              username: formData.username,
              id: data.user_id || '',
              apiKey: data.api_key,
              vectorStoreId: data.vector_store_id,
              assistantId: data.assistant_id || '',
              player: data.player
            })
            navigate('/home')
        }
    }

  return (
      <div className="container">
        <div className="form-box">
          <h1>Login</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button 
              type="submit" 
              className="submit-button"
              disabled={!formData.username || !formData.password}
            >
              Login
            </button>
          </form>
          <button className="register-button" onClick={() => navigate('/register')}>Create Account</button>
        </div>
      </div>
  )
}

export default Login