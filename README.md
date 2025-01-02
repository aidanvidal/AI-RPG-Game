# AI-Assisted Player Creation and Management Tool

## Description
This project is a web application that allows users to register, log in, and create game characters with the help of artificial intelligence. The application consists of a client-side built with React and a server-side API created with Flask. It integrates AI functionality to provide personalized game scenarios based on user-generated character descriptions.

## Features
- User registration and login
- Create and manage game characters
- Generate AI-driven narratives and interactions for characters
- Persistent user session via local storage

---

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.7 or higher)
- Flask
- OpenAI SDK
- A database (e.g., SQLite, PostgreSQL)

### Client Setup
1. Change to the client directory:
   ```bash
   cd client
   ```

2. Install the required packages:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

### Server Setup
1. Change to the server directory:
   ```bash
   cd server
   ```

2. Install Python dependencies using pipenv:
   ```bash
   pipenv install
   ```

3. Ensure your database is set up and goes through the initialization logic provided in `database.py`.

4. Start the Flask server:
   ```bash
   python main.py
   ```

---

## Usage

1. Open your browser and navigate to `http://localhost:3000` to access the application.
2. You can register a new account by navigating to `/register` and filling in the required fields.
3. After registering, create a player.
4. The AI will generate rich narratives based on the character descriptions you provide.
5. Play the game anyway you would like.

---

## Dependencies

### Client-Side
- React
- React Router
- Axios
- OpenAI SDK

### Server-Side
- Flask
- Flask-CORS
- SQLite (or any chosen database)

---

## License
This project is open-source and available under the MIT License.
