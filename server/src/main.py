from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from database import add_user, init_db, get_user, add_message, get_messages, get_player, add_player
from ai_helper import create_vector_store, create_ai_assistant, upload_vector_store, create_player_ai

app = Flask(__name__)
CORS(app)
# Initialize the database when the server starts
init_db()

@app.route('/')
def home():
    # Log the connection time
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"Connection received at {current_time}")
    return "Hello, World!"

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or 'username' not in data or 'password' not in data or 'api_key' not in data:
        return jsonify({'error': 'Username and password and api_key are required'}), 400
    
    # Get the username, password, and api_key from the request
    username = data['username']
    password = data['password']
    api_key = data['api_key']
    
    # Create a vector store for the new user
    vector_store_id = create_vector_store(api_key)
    # vector_store_id = "vs_1234567890"
    
    # Create an AI assistant for the new user
    assistant_id = create_ai_assistant(api_key, vector_store_id)
    # assistant_id = "asst_1234567890"
    
    if add_user(username, password, api_key, vector_store_id, assistant_id):
        user = get_user(username)
        return jsonify({'message': f'User {username} registered successfully', 'user_id': user[0], 'api_key': user[3], 'vector_store_id': user[4], 'assistant_id': user[5]}), 201
    else:
        return jsonify({'error': 'Username already exists'}), 409
    
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Username and password are required'}), 400
    
    username = data['username']
    password = data['password']
    user = get_user(username)
    
    if user and user[2] == password:
        messages = get_messages(user[0])
        player = get_player(user[0])
        return jsonify({
            'message': f'User {username} logged in successfully',
            'user_id': user[0],
            'api_key': user[3],
            'vector_store_id': user[4],
            'assistant_id': user[5],
            'player': player,
            'messages': messages
        }), 200
    else:
        return jsonify({'error': 'Invalid username or password'}), 401

@app.route('/messages', methods=['GET', 'POST'])
def manage_messages():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Authorization header is required', 'received_headers': dict(request.headers)}), 401
    
    username = auth_header.split(' ')[1]  # Get username from "Bearer <username>"
    user = get_user(username)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if request.method == 'GET':
        messages = get_messages(user[0])
        return jsonify({'messages': messages}), 200
    
    elif request.method == 'POST':
        data = request.get_json()
        if not data or 'content' not in data:
            return jsonify({'error': 'Message content is required'}), 400
        
        # Add message to the database
        if(not add_message(user[0], data['content'], data['is_ai_response'])):
            return jsonify({'error': 'Failed to add message to the database'}), 500
        
        # Get the messages from the database
        messages = get_messages(user[0])
        message = messages[-1]
        
        # Check if should upload to vector store
        if(len(messages) % 6 == 0):
            upload_vector_store(user[3], user[4], messages[len(messages) - 6:])
            print("Uploaded to vector store")
        
        return jsonify({'message': message}), 200

@app.route('/create-player', methods=["GET", "POST"])
def create_player():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Authorization header is required', 'received_headers': dict(request.headers)}), 401
    
    username = auth_header.split(' ')[1]  # Get username from "Bearer <username>"
    user = get_user(username)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if request.method == 'GET':
        player = get_player(user[0])
        return jsonify({'player': player}), 200

    data = request.get_json()
    race = data['race']
    clss = data['class']
    desc = data['description']
    name = data['name']
    
    # Send to AI to create a fleshed out player
    player = str(create_player_ai(user[3], name, race, clss, desc))
    
    # Store the results as text
    if(not add_player(user[0], player)):
        return jsonify({'error': 'Failed to add player to the database'}), 500
    
    player = get_player(user[0])
    return jsonify({'player': player}), 200

if __name__ == '__main__':
    print("Server starting...")
    app.run(debug=True, host='0.0.0.0', port=5000)