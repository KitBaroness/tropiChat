/**
 * Main application file for TropiChat
 * Initializes all modules and handles their interactions
 */
(function() {
    // Application state
    let appState = {
        initialized: false,
        walletConnected: false,
        userLoggedIn: false,
        debug: true // Enable debug mode
    };
    
    // Initialize the application when the DOM is loaded
    document.addEventListener('DOMContentLoaded', initApp);
    
    /**
     * Initialize the application
     */
    function initApp() {
        console.log(`${CONFIG.APP_NAME} is initializing...`);
        
        // Debug browser environment
        debugEnvironment();
        
        // Initialize wallet module with callback
        wallet.init(onWalletConnected);
        
        // Initialize chat module
        chat.init();
        
        // Check if browser supports Web3
        checkWeb3Support();
        
        // Display wallet options based on detected providers
        updateWalletUI();
        
        appState.initialized = true;
        console.log(`${CONFIG.APP_NAME} initialization complete.`);
    }
    
    /**
     * Debug the browser environment
     */
    function debugEnvironment() {
        if (!appState.debug) return;
        
        console.log("Browser environment:");
        console.log("User Agent:", navigator.userAgent);
        console.log("window.ethereum:", typeof window.ethereum !== 'undefined');
        console.log("window.solana:", typeof window.solana !== 'undefined');
        console.log("window.WalletConnectProvider:", typeof window.WalletConnectProvider !== 'undefined');
        
        // Check for specific browser extensions
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        const isFirefox = /Firefox/.test(navigator.userAgent);
        const isBrave = navigator.brave && await navigator.brave.isBrave() || false;
        
        console.log("Browser:", {
            isChrome,
            isFirefox,
            isBrave
        });
    }
    
    /**
     * Check if browser supports Web3
     */
    function checkWeb3Support() {
        const hasEthereum = typeof window.ethereum !== 'undefined';
        const hasSolana = typeof window.solana !== 'undefined';
        const hasWalletConnect = typeof window.WalletConnectProvider !== 'undefined';
        
        console.log("Web3 support:", {
            ethereum: hasEthereum,
            solana: hasSolana,
            walletConnect: hasWalletConnect
        });
        
        if (!hasEthereum && !hasSolana && !hasWalletConnect) {
            // Display a message about missing wallet support
            const walletStatus = document.getElementById('wallet-status');
            if (walletStatus) {
                walletStatus.innerHTML = `
                    <p style="color: #ffaa00;">No wallet detected! You'll need a Web3 wallet to join the chat.</p>
                    <p style="font-size: 12px;">
                        Try installing one of these wallets:
                        <a href="https://metamask.io/download/" target="_blank" style="color: #00ffff;">MetaMask</a>,
                        <a href="https://phantom.app/download" target="_blank" style="color: #00ffff;">Phantom</a>, or
                        <a href="https://www.coinbase.com/wallet" target="_blank" style="color: #00ffff;">Coinbase Wallet</a>
                    </p>
                `;
            }
        }
    }
    
    /**
     * Update wallet UI based on detected providers
     */
    function updateWalletUI() {
        const availableProviders = wallet.getAvailableProviders();
        const walletStatus = document.getElementById('wallet-status');
        const walletInfoDiv = document.getElementById('wallet-info');
        
        if (walletInfoDiv && availableProviders.length > 0) {
            let detectedWallets = [];
            
            if (availableProviders.includes('metamask')) detectedWallets.push('MetaMask');
            if (availableProviders.includes('brave')) detectedWallets.push('Brave Wallet');
            if (availableProviders.includes('coinbase')) detectedWallets.push('Coinbase Wallet');
            if (availableProviders.includes('phantom')) detectedWallets.push('Phantom');
            if (availableProviders.includes('solflare')) detectedWallets.push('Solflare');
            
            if (detectedWallets.length > 0) {
                walletInfoDiv.innerHTML = `
                    <p style="color: #00ffff; margin-top: 15px;">
                        Detected wallets: ${detectedWallets.join(', ')}
                    </p>
                `;
            }
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