import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { generateStartMessage } from '../scripts/AI_Helper';
import '../style/Register.css';

interface PlayerCreationProps {
    setUser: (value: {
      username: string;
      id: string;
      apiKey: string;
      vectorStoreId: string;
      assistantId: string;
      player: string
    }) => void;
    user: {
        username: string;
        id: string;
        apiKey: string;
        vectorStoreId: string;
        assistantId: string;  
        player: string
      };
      setIsLoggedIn: (value: boolean) => void;

  }
  

function PlayerCreation({setUser, user, setIsLoggedIn} : PlayerCreationProps) {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        race: '',
        class: '',
        description: '',
        name: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        console.log('Player created:', formData);

        // Send player info to the server
        try {
            const response = await fetch('http://127.0.0.1:5000/create-player', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.username}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);
            setUser({...user, player: data.player})
            console.log("User: ", user);
        } catch (error) {
            console.error('Error sending message:', error);
        }

        // Generate start message
        const startMessage = await generateStartMessage(user);
        
        // Send start message to server
        try {
            const response = await fetch('http://127.0.0.1:5000/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.username}`
                },
                body: JSON.stringify({
                    content: startMessage,
                    is_ai_response: true
                })
            });
            const data = await response.json();
            console.log(data.message);
        } catch (error) {
            console.error('Error sending AI response:', error);
        }
    
        setIsLoggedIn(true);

        // Naviagte to home page
        navigate('/home');
        setIsLoading(false);
    };

    return (
        <div className="container">
            <div className="form-box">
                <h1>Create Player</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Name for the Character</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="race">Race</label>
                        <select
                            id="race"
                            name="race"
                            value={formData.race}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Race</option>
                            <option value="human">Human</option>
                            <option value="elf">Elf</option>
                            <option value="dwarf">Dwarf</option>
                            <option value="halfling">Halfling</option>
                            <option value="orc">Orc</option>
                            <option value="tiefling">Tiefling</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="class">Class</label>
                        <select
                            id="class"
                            name="class"
                            value={formData.class}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Class</option>
                            <option value="warrior">Warrior</option>
                            <option value="wizard">Wizard</option>
                            <option value="rogue">Rogue</option>
                            <option value="druid">Druid</option>
                            <option value="bard">Bard</option>
                            <option value="cleric">Cleric</option>
                            <option value="monk">Monk</option>
                            <option value="ranger">Ranger</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Brief Description</label>
                        <input
                            type="text"
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={!formData.race || !formData.class || !formData.description || isLoading}
                    >
                        {isLoading ? 'Loading...' : 'Create Player'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default PlayerCreation;