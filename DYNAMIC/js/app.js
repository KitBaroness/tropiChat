/**
 * Main application file for TropiChat
 * Initializes all modules and handles their interactions
 */
(function() {
    // Application state
    let appState = {
        initialized: false,
        walletConnected: false,
        userLoggedIn: false
    };
    
    // Initialize the application when the DOM is loaded
    document.addEventListener('DOMContentLoaded', initApp);
    
    /**
     * Initialize the application
     */
    function initApp() {
        console.log(`${CONFIG.APP_NAME} is initializing...`);
        
        // Initialize wallet module with callback
        wallet.init(onWalletConnected);
        
        // Initialize chat module
        chat.init();
        
        // Check if browser supports Web3
        checkWeb3Support();
        
        appState.initialized = true;
        console.log(`${CONFIG.APP_NAME} initialization complete.`);
    }
    
    /**
     * Check if browser supports Web3
     */
    function checkWeb3Support() {
        const hasEthereum = typeof window.ethereum !== 'undefined';
        const hasSolana = typeof window.solana !== 'undefined';
        
        if (!hasEthereum && !hasSolana) {
            // Display a message about missing wallet support
            const walletStatus = document.getElementById('wallet-status');
            walletStatus.innerHTML = `
                <p style="color: #ffaa00;">No wallet detected! You'll need a Web3 wallet to join the chat.</p>
                <p style="font-size: 12px;">Try installing a wallet extension for your browser.</p>
            `;
        }
    }
    
    /**
     * Callback for when wallet is connected
     * @param {String} address - Wallet address
     * @param {String} providerName - Provider name (MetaMask, Phantom, etc.)
     */
    function onWalletConnected(address, providerName) {
        console.log(`Wallet connected: ${address} (${providerName})`);
        appState.walletConnected = true;
        
        // You can add additional functionality here when wallet connects
        // For example, fetching user profile from a database if they've used this wallet before
        
        // Example: Check if user has a saved profile
        checkUserProfile(address);
    }
    
    /**
     * Check if user has a saved profile (example function)
     * @param {String} address - Wallet address
     */
    function checkUserProfile(address) {
        // In a real implementation, this would check a database or blockchain
        // For now, we'll check localStorage as an example
        const savedProfile = localStorage.getItem(`tropichat_user_${address}`);
        
        if (savedProfile) {
            try {
                const profile = JSON.parse(savedProfile);
                console.log(`Found saved profile for ${profile.username}`);
                
                // You could auto-fill the username field
                const usernameInput = document.getElementById('username-input');
                if (usernameInput) {
                    usernameInput.value = profile.username;
                }
            } catch (e) {
                console.error("Error parsing saved profile", e);
            }
        }
    }
    
    /**
     * Save user profile (would be called when user enters chat)
     * @param {String} address - Wallet address
     * @param {String} username - Username
     */
    function saveUserProfile(address, username) {
        const profile = {
            username: username,
            lastLogin: new Date().toISOString()
        };
        
        localStorage.setItem(`tropichat_user_${address}`, JSON.stringify(profile));
    }
    
    // Expose necessary functions to window scope if needed for callbacks
    window.appFunctions = {
        saveUserProfile
    };
    
})();