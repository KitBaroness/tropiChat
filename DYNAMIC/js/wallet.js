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
        connectWalletBtn.addEventListener('click', connect);
        
        // Check if any providers are available
        detectProviders();
    }
    
    /**
     * Detect available wallet providers
     */
    function detectProviders() {
        if (window.ethereum) {
            console.log("Web3 provider detected");
            
            // Check for specific providers
            if (window.ethereum.isMetaMask) {
                console.log("MetaMask detected");
            }
            
            if (window.ethereum.isPhantom) {
                console.log("Phantom detected");
            }
            
            if (window.ethereum.isBraveWallet) {
                console.log("Brave Wallet detected");
            }
            
            if (window.ethereum.isCoinbaseWallet) {
                console.log("Coinbase Wallet detected");
            }
        } else if (window.solana) {
            console.log("Solana provider detected");
        } else {
            console.log("No web3 provider detected");
        }
    }
    
    /**
     * Connect to wallet
     */
    async function connect() {
        try {
            // Try Ethereum providers first (MetaMask, Brave, Coinbase Wallet, etc.)
            if (window.ethereum) {
                _provider = window.ethereum;
                
                // Get provider name for display
                if (_provider.isMetaMask) _providerName = "MetaMask";
                else if (_provider.isBraveWallet) _providerName = "Brave Wallet";
                else if (_provider.isCoinbaseWallet) _providerName = "Coinbase Wallet";
                else _providerName = "Web3 Wallet";
                
                // Request accounts
                const accounts = await _provider.request({ method: 'eth_requestAccounts' });
                _walletAddress = accounts[0];
                _walletConnected = true;
                
                // Set up event listeners
                _provider.on('accountsChanged', handleAccountsChanged);
                _provider.on('disconnect', handleDisconnect);
                
                showSuccessMessage();
            }
            // Try Solana (Phantom) if Ethereum providers not available
            else if (window.solana && window.solana.isPhantom) {
                _provider = window.solana;
                _providerName = "Phantom";
                
                // Connect to Phantom
                const response = await _provider.connect();
                _walletAddress = response.publicKey.toString();
                _walletConnected = true;
                
                // Set up disconnection listener
                _provider.on('disconnect', handleDisconnect);
                
                showSuccessMessage();
            }
            // No wallet available
            else {
                walletStatus.innerHTML = `
                    <p style="color: #ff0000;">No wallet detected! Please install a blockchain wallet extension.</p>
                `;
            }
        } catch (error) {
            console.error("Wallet connection error:", error);
            walletStatus.innerHTML = `
                <p style="color: #ff0000;">Error connecting wallet: ${error.message || "Connection rejected"}</p>
            `;
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
    
    // Public API
    return {
        init,
        connect,
        isConnected,
        getAddress,
        getProviderName
    };
})();