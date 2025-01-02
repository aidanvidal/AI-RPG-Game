import { useState, KeyboardEvent, useEffect } from 'react';
import '../style/Home.css';
import { generateAiResponse } from '../scripts/AI_Helper';

interface Message {
  id: string;
  content: string;
  is_ai_response: boolean;
  timestamp: string;
}

interface HomeProps {
    isLoggedIn: boolean;
    setIsLoggedIn: (value: boolean) => void;
    user: {
      username: string;
      id: string;
      apiKey: string;
      vectorStoreId: string;
      assistantId: string;  
      player: string
    };
    setUser: (value: {
      username: string;
      id: string;
      apiKey: string;
      vectorStoreId: string;
      assistantId: string;
      player: string
    }) => void;
}

function Home({ setIsLoggedIn, user, setUser }: HomeProps) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get the chat history from the server when the component mounts
  useEffect(() => {
    getChatHistory().then(history => {
      if (Array.isArray(history)) {
        setChatHistory(history);
      } else {
        console.error('Chat history is not an array:', history);
        setChatHistory([]);
      }
    });
  }, []);

  // Get the chat history from the server
  const getChatHistory = async () => {
    console.log('Getting chat history for user:', user.username)
    try {
      const response = await fetch('http://127.0.0.1:5000/messages', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.username}`
        },
      });
      const data = await response.json();
      // Return the messages array directly since it's already in the correct format
      return Array.isArray(data.messages) ? data.messages : [];
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }

  // Handle the submit button
  const handleSubmit = async () => {
    // Check if the message is empty
    if (!message.trim()) return;

    // Set loading state
    setIsLoading(true);
    
    const currentMessage = message; // Store the current message
    setMessage(''); // Clear input field
    
    try {
        const response = await fetch('http://127.0.0.1:5000/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.username}`
            },
            body: JSON.stringify({
                content: currentMessage,
                is_ai_response: false
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        setChatHistory(prev => [...prev, data.message]);

    } catch (error) {
        console.error('Error sending message:', error);
    }

    // Get AI response
    const aiResponse = await generateAiResponse(user.apiKey, user.assistantId, chatHistory, user);
    try {
        const response = await fetch('http://127.0.0.1:5000/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.username}`
            },
            body: JSON.stringify({
                content: aiResponse,
                is_ai_response: true
            })
        });
        const data = await response.json();
        setChatHistory(prev => [...prev, data.message]);
    } catch (error) {
        console.error('Error sending AI response:', error);
    }

    setIsLoading(false);

  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };
  
  // Formats the ** in player description to be bolded
  function formatContent(description : string) {
    if (!description) return null;
    // Replace (word) with <strong>word</strong>
    const formattedText = description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Use dangerouslySetInnerHTML to render the formatted text as HTML
    return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
  }

  return (
    <div className="home-container">
  <div className="left-column">
    <div className="player-description">
    {formatContent(user.player)}
    </div>
  </div>
  <div className="right-column">
    <div className="home-header">
      <h1>Chat Interface</h1>
      <div className="main-nav">
        <button
          className="nav-button logout"
          onClick={() => {
            setIsLoggedIn(false);
            setUser({ username: '', id: '', apiKey: '', vectorStoreId: '', assistantId: '', player: '' });
          }}
        >
          Logout
        </button>
      </div>
    </div>

    <div className="chat-container">
      <div className="response-container">
        {chatHistory.map((msg) => (
          <div 
            key={msg.id} 
            className={`chat-entry ${msg.is_ai_response ? 'response-text' : 'user-message'}`}
            title={new Date(msg.timestamp).toLocaleString()}
          >
            {formatContent(msg.content)}
          </div>
        ))}
      </div>

      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          className="message-input"
          disabled={isLoading}
        />
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading}
          className="send-button"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  </div>
</div>
  );
}

export default Home;