# TropiChat - 90s Style Web3 Chat Room

This is a nostalgic 90s-style chat room implementation with web3 wallet authentication. The application has been modularized for better organization, maintainability, and extensibility.

## File Structure

```
tropichat/
├── index.html               # Main HTML structure
├── css/
│   └── style.css            # All styling for the application
├── js/
│   ├── config.js            # Configuration settings and constants
│   ├── wallet.js            # Web3 wallet connection functionality
│   ├── chat.js              # Chat room functionality
│   └── app.js               # Main application initialization
└── README.md                # This documentation file
```

## Implementation Guide

### 1. Set up your file structure

Create the folders and files as shown in the structure above.

### 2. Install dependencies (for a production version)

For a full implementation with server-side functionality, you'll need:

- Node.js with Express for the backend
- Socket.io for real-time communication
- MongoDB or another database to store chat history and user information

### 3. Backend Implementation (for production)

To make the chat truly functional with multiple users, you would need to:

1. Create a server using Node.js and Express
2. Set up Socket.io for real-time messaging
3. Implement database storage for messages
4. Create API endpoints for user authentication and verification
5. Add NFT wallet verification with Ethereum/Web3

Example backend structure (not included in this package):

```javascript
// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Web3 = require('web3');

// Initialize server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to database
mongoose.connect('mongodb://localhost/tropichat', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected');
    
    // Handle user join
    socket.on('join', (userData) => {
        // Verify wallet signature
        // Add user to active users
        // Broadcast user joined
    });