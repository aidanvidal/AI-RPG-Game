import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../style/Register.css'

interface RegisterProps {
  setUser: (value: {
    username: string;
    id: string;
    apiKey: string;
    vectorStoreId: string;
    assistantId: string;
    player: string
  }) => void;
}

// Register page
function Register({ setUser }: RegisterProps) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
      username: '',
      password: '',
      api_key: '',
      vector_store_id: ''
    })
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      const response = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      console.log('Form submitted:', formData)
      console.log('Response:', data)
  
      if (data.error) {
        console.error('Error:', data.error)
        alert(data.error)
      } else {
        // Set user data
        setUser({
          username: formData.username,
          id: data.user_id || '',
          apiKey: formData.api_key,
          vectorStoreId: formData.vector_store_id,
          assistantId: data.assistant_id || '',
          player: ''
        })
        // Navigate to create player page
        navigate('/create-player')
      }
    }
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  
    return (
      <div className="container">
        <div className="form-box">
          <h1>Create Account</h1>
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
            <div className="form-group">
              <label htmlFor="api_key">API Key</label>
              <input
                type="password"
                id="api_key"
                name="api_key"
                value={formData.api_key}
                onChange={handleChange}
                required
              />
            </div>
            <button 
              type="submit" 
              className="submit-button"
              disabled={!formData.username || !formData.password || !formData.api_key}
            >
              Create Account
            </button>
          </form>
          <button className="login-button" onClick={() => navigate('/login')}>Login</button>
        </div>
      </div>
    )
  }
  
export default Register;