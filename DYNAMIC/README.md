# TropiChat - 90s Style Web3 Chat Room

This is a nostalgic 90s-style chat room implementation with multi-wallet web3 authentication. The application has been modularized for better organization, maintainability, and extensibility.

## Features

- 🌴 Retro 90s aesthetic with animated backgrounds, marquees, and Comic Sans
- 👛 Multi-wallet support (MetaMask, Phantom, Brave Wallet, Coinbase Wallet)
- 👤 Custom username creation with colorful chat messages
- 🤖 Simulated users and responses for testing
- 💬 Chat commands like /help, /clear, /shrug, /me, and /color
- 🎨 Fully responsive design that works on mobile and desktop
- 🧩 Modular architecture for easy extension and maintenance

## File Structure

```
tropichat/
├── index.html               # Main HTML structure
├── css/
│   └── style.css            # All styling for the application
├── js/
│   ├── config.js            # Configuration settings and constants
│   ├── wallet.js            # Multi-wallet Web3 connection functionality
│   ├── chat.js              # Chat room functionality
│   └── app.js               # Main application initialization
└── README.md                # This documentation file
```

## Implementation Guide

### 1. Set up your file structure

Create the folders and files as shown in the structure above. Place each file in its corresponding directory.

### 2. Adding to Your Website

1. Copy the entire `tropichat` directory to your website's root folder
2. Include it in your main page with:
   ```html
   <iframe src="/tropichat/index.html" style="width: 100%; height: 600px; border: none;"></iframe>
   ```
   
3. Or link to it from your navigation:
   ```html
   <a href="/tropichat/index.html">Join Our Chat Room</a>
   ```

### 3. Wallet Support

The chat room supports multiple wallet providers:

- **Ethereum-based wallets**: MetaMask, Brave Wallet, Coinbase Wallet, Trust Wallet
- **Solana-based wallets**: Phantom
- More can be added by extending the wallet.js module

Users only need to have one of these wallets installed in their browser to connect.

### 4. Production Implementation

For a full implementation with server-side functionality, you'll need:

- Node.js with Express for the backend
- Socket.io for real-time communication
- MongoDB or another database to store chat history and user information

#### Backend Implementation Example

```javascript
// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const { ethers } = require('ethers');

// Initialize server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static('public'));

// Connect to database
mongoose.connect('mongodb://localhost/tropichat', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define schemas
const User = mongoose.model('User', {
    username: String,
    wallet: String,
    provider: String,
    color: String,
    lastSeen: Date
});

const Message = mongoose.model('Message', {
    username: String,
    wallet: String,
    color: String,
    text: String,
    timestamp: Date
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected');
    
    // Handle user join
    socket.on('join', async (userData) => {
        const { username, wallet, color, provider } = userData;
        
        // Save or update user
        await User.findOneAndUpdate(
            { wallet },
            { username, wallet, color, provider, lastSeen: new Date() },
            { upsert: true }
        );
        
        // Add user to socket room
        socket.join('main-room');
        
        // Broadcast user joined
        io.to('main-room').emit('user-joined', {
            username,
            color,
            timestamp: new Date()
        });
        
        // Send last 50 messages
        const lastMessages = await Message.find()
            .sort({ timestamp: -1 })
            .limit(50)
            .lean();
            
        socket.emit('message-history', lastMessages.reverse());
    });
    
    // Handle chat message
    socket.on('chat-message', async (messageData) => {
        const { text, username, wallet, color } = messageData;
        
        // Save message
        const message = new Message({
            username,
            wallet,
            color,
            text,
            timestamp: new Date()
        });
        
        await message.save();
        
        // Broadcast message
        io.to('main-room').emit('chat-message', {
            username,
            color,
            text,
            timestamp: new Date()
        });
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### 5. Customization

You can customize TropiChat by:

1. Modifying `config.js` to change settings, mock users, and responses
2. Updating `style.css` to change the visual appearance
3. Adding new commands in the `handleCommand` function in `chat.js`
4. Adding new emoji options to the emoji picker in `index.html`
5. Implementing new wallet providers in `wallet.js`

### 6. Security Considerations

When implementing this chat in production:

1. Always verify wallet signatures on the server to prevent address spoofing
2. Implement rate limiting to prevent spam
3. Add moderation tools for inappropriate content
4. Consider encrypting messages for privacy
5. Store sensitive data securely and follow data protection regulations