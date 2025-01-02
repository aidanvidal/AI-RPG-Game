import sqlite3
import json

def init_db():
    """Initialize the database and create the necessary tables if they don't exist."""
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            api_key TEXT,
            vector_store_id TEXT,
            assistant_id TEXT,
            player TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create messages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            is_ai_response BOOLEAN NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully")

def add_user(username: str, password: str, api_key: str = None, vector_store_id: str = None, assistant_id: str = None) -> bool:
    """
    Add a new user to the database.
    Returns True if successful, False if user already exists.
    """
    try:
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        
        cursor.execute(
            'INSERT INTO users (username, password, api_key, vector_store_id, assistant_id) VALUES (?, ?, ?, ?, ?)',
            (username, password, api_key, vector_store_id, assistant_id)  # In a real app, you'd want to hash this password
        )
        
        conn.commit()
        conn.close()
        print(f"User {username} added successfully")
        return True
        
    except sqlite3.IntegrityError:
        print(f"User {username} already exists")
        return False
    except Exception as e:
        print(f"Error adding user: {e}")
        return False

def get_user(username: str) -> tuple:
    """
    Retrieve a user from the database.
    Returns tuple of (id, username, password, api_key, vector_store_id, assistant_id, created_at) 
    or None if not found.
    """
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
    user = cursor.fetchone()
    
    conn.close()
    return user

def add_message(user_id: int, content: str, is_ai_response: bool) -> bool:
    """Add a new message to the database."""
    try:
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        
        cursor.execute(
            'INSERT INTO messages (user_id, content, is_ai_response) VALUES (?, ?, ?)',
            (user_id, content, is_ai_response)
        )
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Error adding message: {e}")
        return False

def get_messages(user_id: int) -> list:
    """Get all messages for a user."""
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, content, is_ai_response, timestamp 
        FROM messages 
        WHERE user_id = ? 
        ORDER BY timestamp ASC
    ''', (user_id,))
    messages = cursor.fetchall()
    
    conn.close()
    return [
        {
            'id': msg[0],
            'content': msg[1],
            'is_ai_response': bool(msg[2]),
            'timestamp': msg[3]
        }
        for msg in messages
    ]
    
def add_player(user_id: int, player: str) -> bool:
    """Add a player to the user."""
    try:
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        
        cursor.execute(
            'UPDATE users SET player = ? WHERE id = ?',
            (player, user_id)
        )
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Error adding player: {e}")
        return False

def get_player(user_id: int) -> str:
    """Get player description"""
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    cursor.execute('''
                   SELECT player
                   FROM users
                   WHERE id = ?
                   ''', (user_id,))
    player = cursor.fetchone()
    conn.close()
    return player[0] if player else None

if __name__ == "__main__":
    # Initialize the database when this file is run directly
    init_db()
