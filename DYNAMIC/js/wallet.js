/**
 * Wallet connection module for TropiChat
 */
const wallet = (function() {
    // Private variables
    let _walletAddress = null;
    let _walletConnected = false;
    let _onConnectedCallback = null;
    
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
    }
    
    /**
     * Connect to wallet
     */
    async function connect() {
        if (window.ethereum) {
            try {
                // Request account access
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                _walletAddress = accounts[0];
                _walletConnected = true;
                
                // Show success message
                walletStatus.innerHTML = `
                    <p style="color: #00ff00;">Wallet connected!</p>
                    <div id="wallet-address">${_walletAddress}</div>
                `;
                
                // Show username input
                usernameContainer.style.display = 'block';
                connectWalletBtn.style.display = 'none';
                
                // Execute callback if defined
                if (_onConnectedCallback) {
                    _onConnectedCallback(_walletAddress);
                }
                
                // Setup event listener for account changes
                window.ethereum.on('accountsChanged', handleAccountsChanged);
                
            } catch (error) {
                console.error(error);
                walletStatus.innerHTML = `
                    <p style="color: #ff0000;">Error connecting wallet: ${error.message}</p>
                `;
            }
        } else {
            walletStatus.innerHTML = `
                <p style="color: #ff0000;">MetaMask not found! Please install MetaMask to continue.</p>
            `;
        }
    }
    
    /**
     * Handle when user changes accounts
     * @param {Array} accounts - Array of accounts
     */
    function handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            // User disconnected their wallet
            _walletConnected = false;
            _walletAddress = null;
            
            walletStatus.innerHTML = `
                <p style="color: #ff0000;">Wallet disconnected. Please reconnect.</p>
            `;
            
            usernameContainer.style.display = 'none';
            connectWalletBtn.style.display = 'block';
            
        } else if (accounts[0] !== _walletAddress) {
            // User switched to a different account
            _walletAddress = accounts[0];
            
            walletStatus.innerHTML = `
                <p style="color: #00ff00;">Switched to new wallet!</p>
                <div id="wallet-address">${_walletAddress}</div>
            `;
        }
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
    
    // Public API
    return {
        init,
        connect,
        isConnected,
        getAddress
    };
})();