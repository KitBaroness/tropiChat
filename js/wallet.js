/**
 * Wallet connection module for TropiChat
 * Supports multiple wallet providers: MetaMask, Phantom, Brave, Coinbase, etc.
 */
const wallet = (function() {
    // Private variables
    let _walletAddress = null;
    let _walletConnected = false;
    let _onConnectedCallback = null;
    let _provider = null;
    let _providerName = null;
    let _availableProviders = [];
    
    // DOM elements
    const connectWalletBtn = document.getElementById('connect-wallet');
    const walletStatus = document.getElementById('wallet-status');
    const usernameContainer = document.getElementById('username-container');
    
    /**
     * Initialize wallet module
     * @param {Function} onConnectedCallback - Callback to execute when wallet is connected
     */
    function init(onConnectedCallback) {
        _onConnectedCallback = onConnectedCallback;
        
        // Event listeners
        if (connectWalletBtn) {
            connectWalletBtn.addEventListener('click', connect);
        } else {
            console.error("Connect wallet button not found");
        }
        
        // Check for available providers
        _availableProviders = detectProviders();
        
        // Debug: Show available providers
        console.log("Available wallet providers:", _availableProviders);
    }
    
    /**
     * Detect available wallet providers
     * @returns {Array} List of available provider names
     */
    function detectProviders() {
        const providers = [];
        
        // Debug for available objects
        console.log("Checking for wallet providers...");
        console.log("window.ethereum:", typeof window.ethereum);
        console.log("window.solana:", typeof window.solana);
        
        // Check Ethereum providers
        if (window.ethereum) {
            console.log("Ethereum provider detected");
            providers.push("ethereum");
            
            try {
                // Check for specific Ethereum providers
                if (window.ethereum.isMetaMask) {
                    console.log("MetaMask detected");
                    providers.push("metamask");
                }
                
                if (window.ethereum.isBraveWallet) {
                    console.log("Brave Wallet detected");
                    providers.push("brave");
                }
                
                if (window.ethereum.isCoinbaseWallet) {
                    console.log("Coinbase Wallet detected");
                    providers.push("coinbase");
                }
                
                if (window.ethereum.isTokenPocket) {
                    console.log("TokenPocket detected");
                    providers.push("tokenpocket");
                }
                
                if (window.ethereum.isImToken) {
                    console.log("imToken detected");
                    providers.push("imtoken");
                }
                
                if (window.ethereum.isMathWallet) {
                    console.log("MathWallet detected");
                    providers.push("mathwallet");
                }
                
                if (window.ethereum.isExodus) {
                    console.log("Exodus detected");
                    providers.push("exodus");
                }
                
                // Some wallets don't have a specific flag, so we check for specific properties
                if (window.ethereum.isMetaMask === undefined && 
                    window.ethereum.isBraveWallet === undefined && 
                    window.ethereum._metamask) {
                    console.log("Trust Wallet or other MetaMask-compatible wallet detected");
                    providers.push("metamask-compatible");
                }
            } catch (err) {
                console.warn("Error detecting specific Ethereum wallets:", err);
            }
        }
        
        // Check Solana providers
        if (window.solana) {
            console.log("Solana provider detected");
            providers.push("solana");
            
            try {
                if (window.solana.isPhantom) {
                    console.log("Phantom detected");
                    providers.push("phantom");
                }
                
                if (window.solana.isSolflare) {
                    console.log("Solflare detected");
                    providers.push("solflare");
                }
            } catch (err) {
                console.warn("Error detecting specific Solana wallets:", err);
            }
        }
        
        // Check for WalletConnect
        if (typeof window.WalletConnectProvider !== 'undefined') {
            console.log("WalletConnect detected");
            providers.push("walletconnect");
        }
        
        return providers;
    }
    
    /**
     * Connect to wallet
     */
    async function connect() {
        console.log("Connect wallet button clicked");
        
        try {
            // Update status to show we're trying to connect
            walletStatus.innerHTML = `
                <p style="color: #ffcc00;">Attempting to connect wallet...</p>
            `;
            
            // Re-detect available providers to make sure we have the latest
            _availableProviders = detectProviders();
            
            // If we found providers, try to connect
            if (_availableProviders.length > 0) {
                console.log("Trying to connect with available providers:", _availableProviders);
                
                // Try Ethereum providers first
                if (_availableProviders.includes("ethereum")) {
                    await connectEthereumWallet();
                } 
                // If Ethereum failed or not available, try Solana
                else if (_availableProviders.includes("solana")) {
                    await connectSolanaWallet();
                }
                // If both failed, show message
                else {
                    walletStatus.innerHTML = `
                        <p style="color: #ff0000;">No compatible wallet detected! Please install a blockchain wallet extension.</p>
                    `;
                }
            } else {
                console.log("No wallet providers detected");
                walletStatus.innerHTML = `
                    <p style="color: #ff0000;">No wallet detected! Please install a blockchain wallet extension.</p>
                `;
            }
        } catch (error) {
            console.error("Error in connect function:", error);
            walletStatus.innerHTML = `
                <p style="color: #ff0000;">Error connecting wallet: ${error.message || "Unknown error"}</p>
            `;
        }
    }
    
    /**
     * Connect to Ethereum wallet
     */
    async function connectEthereumWallet() {
        console.log("Attempting to connect Ethereum wallet");
        
        try {
            _provider = window.ethereum;
            
            // Get provider name for display
            if (_provider.isMetaMask) _providerName = "MetaMask";
            else if (_provider.isBraveWallet) _providerName = "Brave Wallet";
            else if (_provider.isCoinbaseWallet) _providerName = "Coinbase Wallet";
            else if (_provider.isTokenPocket) _providerName = "TokenPocket";
            else if (_provider.isImToken) _providerName = "imToken";
            else if (_provider.isMathWallet) _providerName = "MathWallet";
            else if (_provider.isExodus) _providerName = "Exodus";
            else _providerName = "Web3 Wallet";
            
            console.log(`Requesting accounts from ${_providerName}...`);
            
            // Request accounts
            const accounts = await _provider.request({ method: 'eth_requestAccounts' });
            
            if (accounts && accounts.length > 0) {
                console.log("Accounts received:", accounts);
                _walletAddress = accounts[0];
                _walletConnected = true;
                
                // Set up event listeners
                _provider.on('accountsChanged', handleAccountsChanged);
                _provider.on('disconnect', handleDisconnect);
                
                showSuccessMessage();
                return true;
            } else {
                console.error("No accounts received from wallet");
                walletStatus.innerHTML = `
                    <p style="color: #ff0000;">No accounts received from wallet. Please try again.</p>
                `;
                return false;
            }
        } catch (error) {
            console.error("Error connecting Ethereum wallet:", error);
            walletStatus.innerHTML = `
                <p style="color: #ff0000;">Error connecting Ethereum wallet: ${error.message || "User rejected request"}</p>
            `;
            return false;
        }
    }
    
    /**
     * Connect to Solana wallet
     */
    async function connectSolanaWallet() {
        console.log("Attempting to connect Solana wallet");
        
        try {
            _provider = window.solana;
            
            // Get provider name for display
            if (_provider.isPhantom) _providerName = "Phantom";
            else if (_provider.isSolflare) _providerName = "Solflare";
            else _providerName = "Solana Wallet";
            
            console.log(`Requesting connection to ${_providerName}...`);
            
            // Connect to Phantom
            const response = await _provider.connect();
            
            if (response && response.publicKey) {
                console.log("Solana connection response:", response);
                _walletAddress = response.publicKey.toString();
                _walletConnected = true;
                
                // Set up disconnection listener
                _provider.on('disconnect', handleDisconnect);
                
                showSuccessMessage();
                return true;
            } else {
                console.error("Invalid response from Solana wallet");
                walletStatus.innerHTML = `
                    <p style="color: #ff0000;">Invalid response from Solana wallet. Please try again.</p>
                `;
                return false;
            }
        } catch (error) {
            console.error("Error connecting Solana wallet:", error);
            walletStatus.innerHTML = `
                <p style="color: #ff0000;">Error connecting Solana wallet: ${error.message || "User rejected request"}</p>
            `;
            return false;
        }
    }
    
    /**
     * Show success message after connecting
     */
    function showSuccessMessage() {
        // Show success message with provider name
        walletStatus.innerHTML = `
            <p style="color: #00ff00;">${_providerName} connected!</p>
            <div id="wallet-address">${formatWalletAddress(_walletAddress)}</div>
        `;
        
        // Show username input
        usernameContainer.style.display = 'block';
        connectWalletBtn.style.display = 'none';
        
        // Execute callback if defined
        if (_onConnectedCallback) {
            _onConnectedCallback(_walletAddress, _providerName);
        }
    }
    
    /**
     * Format wallet address for display (shortens it)
     * @param {String} address - Full wallet address
     * @returns {String} - Formatted address
     */
    function formatWalletAddress(address) {
        if (!address) return '';
        return address.substring(0, 6) + '...' + address.substring(address.length - 4);
    }
    
    /**
     * Handle when user changes accounts
     * @param {Array} accounts - Array of accounts
     */
    function handleAccountsChanged(accounts) {
        console.log("Accounts changed:", accounts);
        
        if (accounts.length === 0) {
            // User disconnected their wallet
            handleDisconnect();
        } else if (accounts[0] !== _walletAddress) {
            // User switched to a different account
            _walletAddress = accounts[0];
            
            walletStatus.innerHTML = `
                <p style="color: #00ff00;">Switched to new wallet!</p>
                <div id="wallet-address">${formatWalletAddress(_walletAddress)}</div>
            `;
        }
    }
    
    /**
     * Handle wallet disconnection
     */
    function handleDisconnect() {
        console.log("Wallet disconnected");
        
        _walletConnected = false;
        _walletAddress = null;
        
        walletStatus.innerHTML = `
            <p style="color: #ff0000;">Wallet disconnected. Please reconnect.</p>
        `;
        
        usernameContainer.style.display = 'none';
        connectWalletBtn.style.display = 'block';
    }
    
    /**
     * Check if wallet is connected
     * @returns {Boolean} - True if wallet is connected
     */
    function isConnected() {
        return _walletConnected;
    }
    
    /**
     * Get wallet address
     * @returns {String} - Wallet address
     */
    function getAddress() {
        return _walletAddress;
    }
    
    /**
     * Get provider name
     * @returns {String} - Provider name
     */
    function getProviderName() {
        return _providerName;
    }
    
    /**
     * Get available providers
     * @returns {Array} - List of available provider names
     */
    function getAvailableProviders() {
        return _availableProviders;
    }
    
    // Public API
    return {
        init,
        connect,
        isConnected,
        getAddress,
        getProviderName,
        getAvailableProviders
    };
})();