/**
 * Chat functionality module for TropiChat
 */
const chat = (function() {
    // Private variables
    let _currentUser = null;
    
    // DOM elements
    const loginModal = document.getElementById('login-modal');
    const usernameInput = document.getElementById('username-input');
    const enterChatBtn = document.getElementById('enter-chat');
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const onlineUsersContainer = document.getElementById('online-users');
    
    /**
     * Initialize chat module
     */
    function init() {
        // Event listeners
        enterChatBtn.addEventListener('click', enterChat);
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Populate mock users
        populateMockUsers();
        
        // Welcome messages
        addSystemMessage(CONFIG.SYSTEM_MESSAGES.WELCOME);
        addSystemMessage("Type /help for available commands.");
    }
    
    /**
     * Add mock users to the online users list
     */
    function populateMockUsers() {
        CONFIG.MOCK_USERS.forEach(user => {
            const randomColor = CONFIG.USER_COLORS[Math.floor(Math.random() * CONFIG.USER_COLORS.length)];
            const userElement = document.createElement('div');
            userElement.classList.add('online-user');
            userElement.textContent = user;
            userElement.style.color = randomColor;
            onlineUsersContainer.appendChild(userElement);
        });
    }
    
    /**
     * Enter chat with username
     */
    function enterChat() {
        const username = usernameInput.value.trim();
        
        if (username) {
            // Get wallet address
            const address = wallet.getAddress();
            const walletProvider = wallet.getProviderName();
            
            _currentUser = {
                name: username,
                color: CONFIG.USER_COLORS[Math.floor(Math.random() * CONFIG.USER_COLORS.length)],
                wallet: address,
                provider: walletProvider
            };
            
            // Close login modal
            loginModal.style.display = 'none';
            
            // Enable chat functionality
            messageInput.disabled = false;
            sendButton.disabled = false;
            
            // Add user to online users
            const userElement = document.createElement('div');
            userElement.classList.add('online-user');
            userElement.textContent = _currentUser.name;
            userElement.style.color = _currentUser.color;
            onlineUsersContainer.appendChild(userElement);
            
            // Announce user joined
            addSystemMessage(`${_currentUser.name} has joined the chat!`);
            
            // Save user profile if the app has this function available
            if (window.appFunctions && window.appFunctions.saveUserProfile) {
                window.appFunctions.saveUserProfile(address, username);
            }
            
            // If you're implementing server-side functionality later,
            // this is where you would emit a "join" event to the server
            // Example: socket.emit('join', { username, address, color: _currentUser.color });
        } else {
            alert('Please enter a username!');
        }
    }
    
    /**
     * Add a system message to the chat
     * @param {String} text - Message text
     */
    function addSystemMessage(text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        
        const usernameSpan = document.createElement('span');
        usernameSpan.classList.add('username');
        usernameSpan.style.color = '#ffcc00';
        usernameSpan.textContent = CONFIG.APP_NAME + ':';
        
        const messageText = document.createElement('span');
        messageText.textContent = ' ' + text;
        
        messageElement.appendChild(usernameSpan);
        messageElement.appendChild(messageText);
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    /**
     * Add a user message to the chat
     * @param {Object} user - User object
     * @param {String} text - Message text
     */
    function addUserMessage(user, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        
        const usernameSpan = document.createElement('span');
        usernameSpan.classList.add('username');
        usernameSpan.style.color = user.color;
        usernameSpan.textContent = user.name + ':';
        
        const messageText = document.createElement('span');
        messageText.innerHTML = ' ' + formatMessage(text);
        
        messageElement.appendChild(usernameSpan);
        messageElement.appendChild(messageText);
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    /**
     * Format message - convert URLs to links, etc.
     * @param {String} text - Message text
     * @returns {String} - Formatted message
     */
    function formatMessage(text) {
        // Convert URLs to clickable links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, function(url) {
            return `<a href="${url}" target="_blank" style="color: #00ffff;">${url}</a>`;
        });
    }
    
    /**
     * Send a message
     */
    function sendMessage() {
        const messageText = messageInput.value.trim();
        
        if (messageText && _currentUser) {
            // Check for commands
            if (messageText.startsWith('/')) {
                handleCommand(messageText);
            } else {
                // Regular message
                addUserMessage(_currentUser, messageText);
                
                // Simulate responses from mock users
                simulateMockResponses();
            }
            
            // Clear input
            messageInput.value = '';
        }
    }
    
    /**
     * Handle chat commands
     * @param {String} command - Command text
     */
    function handleCommand(command) {
        const cmd = command.toLowerCase();
        
        if (cmd === CONFIG.COMMANDS.HELP) {
            addSystemMessage(CONFIG.SYSTEM_MESSAGES.HELP_COMMAND);
        } else if (cmd === CONFIG.COMMANDS.CLEAR) {
            chatMessages.innerHTML = '';
            addSystemMessage(CONFIG.SYSTEM_MESSAGES.CLEAR_COMMAND);
        } else if (cmd === CONFIG.COMMANDS.SHRUG) {
            addUserMessage(_currentUser, '¯\\_(ツ)_/¯');
        } else if (cmd.startsWith(CONFIG.COMMANDS.ME + ' ')) {
            const action = command.substring(4);
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.style.color = '#ff00ff';
            messageElement.textContent = `* ${_currentUser.name} ${action}`;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } else if (cmd.startsWith(CONFIG.COMMANDS.COLOR + ' ')) {
            const color = command.substring(7);
            if (color.match(/^#[0-9A-F]{6}$/i)) {
                _currentUser.color = color;
                addSystemMessage(CONFIG.SYSTEM_MESSAGES.COLOR_CHANGED);
            } else {
                addSystemMessage(CONFIG.SYSTEM_MESSAGES.INVALID_COLOR);
            }
        } else {
            addSystemMessage(CONFIG.SYSTEM_MESSAGES.UNKNOWN_COMMAND.replace('{command}', command));
        }
    }
    
    /**
     * Simulate responses from mock users
     */
    function simulateMockResponses() {
        // Simulate responses with configured chance
        if (Math.random() < CONFIG.SIMULATION.RESPONSE_CHANCE) {
            setTimeout(() => {
                const randomUser = CONFIG.MOCK_USERS[Math.floor(Math.random() * CONFIG.MOCK_USERS.length)];
                const randomColor = CONFIG.USER_COLORS[Math.floor(Math.random() * CONFIG.USER_COLORS.length)];
                const randomResponseTemplate = CONFIG.MOCK_RESPONSES[Math.floor(Math.random() * CONFIG.MOCK_RESPONSES.length)];
                const randomResponse = randomResponseTemplate.replace('{username}', _currentUser.name);
                
                addUserMessage({name: randomUser, color: randomColor}, randomResponse);
            }, CONFIG.SIMULATION.MIN_DELAY + Math.random() * (CONFIG.SIMULATION.MAX_DELAY - CONFIG.SIMULATION.MIN_DELAY));
        }
    }
    
    /**
     * Add emoji to message input
     * @param {String} emoji - Emoji character
     */
    function addEmoji(emoji) {
        if (!messageInput.disabled) {
            messageInput.value += emoji;
            messageInput.focus();
        }
    }
    
    /**
     * Get current user
     * @returns {Object} - Current user object
     */
    function getCurrentUser() {
        return _currentUser;
    }
    
    // Public API
    return {
        init,
        enterChat,
        addSystemMessage,
        addUserMessage,
        sendMessage,
        addEmoji,
        getCurrentUser
    };
})();