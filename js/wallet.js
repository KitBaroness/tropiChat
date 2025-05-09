/**
 * Wallet connection module for TropiChat
 * Simple approach to wallet connection that should work with any available wallet
 */
const wallet = (function() {
    // Private variables
    let _walletAddress = null;
    let _walletConnected = false;
    let _onConnectedCallback = null;
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
        if (connectWalletBtn) {
            connectWalletBtn.addEventListener('click', connect);
        } else {
            console.error("Connect wallet button not found");
        }
        
        // Simple test to see if any wallet is available
        checkForWallets();
    }
    
    /**
     * Check if any wallet is available
     * Just a simple check to update the UI accordingly
     */
    function checkForWallets() {
        const hasEthereum = typeof window.ethereum !== 'undefined';
        const hasSolana = typeof window.solana !== 'undefined' && typeof window.solana.connect === 'function';
        
        console.log("Wallet check:", { hasEthereum, hasSolana });
        
        // Update UI based on wallet availability
        if (walletStatus && !hasEthereum && !hasSolana) {
            walletStatus.innerHTML = `
                <p style="color: #ffaa00;">No wallet detected. You need to install a wallet to join the chat.</p>
            `;
        }
        
        return hasEthereum || hasSolana;
    }
    
    /**
     * Connect to any available wallet
     * This simplified approach works with most wallets including MetaMask, Brave, etc.
     */
    async function connect() {
        // Show connecting state
        if (walletStatus) {
            walletStatus.innerHTML = `
                <p style="color: #ffcc00;">Connecting to wallet...</p>
                <div class="spinner"></div>
            `;
        }
        
        // Add spinner style if not already present
        if (!document.getElementById('wallet-spinner-style')) {
            const style = document.createElement('style');
            style.id = 'wallet-spinner-style';
            style.textContent = `
                .spinner {
                    margin: 10px auto;
                    width: 30px;
                    height: 30px;
                    border: 3px solid #00ffff;
                    border-radius: 50%;
                    border-top-color: transparent;
                    animation: spinner 1s linear infinite;
                }
                @keyframes spinner {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        try {
            // First try Ethereum wallets (most common)
            if (typeof window.ethereum !== 'undefined') {
                await connectEthereumWallet();
                return;
            }
            
            // Then try Solana wallets (like Phantom)
            if (typeof window.solana !== 'undefined' && typeof window.solana.connect === 'function') {
                await connectSolanaWallet();
                return;
            }
            
            // If we get here, no wallet was available
            if (walletStatus) {
                walletStatus.innerHTML = `
                    <p style="color: #ff0000;">No wallet found. Please install one of these:</p>
                    <div style="display: flex; justify-content: center; margin-top: 10px;">
                        <a href="https://metamask.io/download/" target="_blank" style="margin: 0 5px;">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                                 alt="MetaMask" style="width: 30px; height: 30px;">
                        </a>
                        <a href="https://phantom.app/download" target="_blank" style="margin: 0 5px;">
                            <img src="https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=2,format=auto/https%3A%2F%2F4022901204-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-MU27jC4gReVdpHQjfbd%252Ficon%252F68szorVVwlQjEpEsW3zy%252FGroup%25201030.png%3Falt%3Dmedia%26token%3Da3a5a933-7009-4e5e-9ca6-79285d1bd5f7" 
                                 alt="Phantom" style="width: 30px; height: 30px;">
                        </a>
                        <a href="https://www.coinbase.com/wallet/downloads" target="_blank" style="margin: 0 5px;">
                            <img src="https://altcoinsbox.com/wp-content/uploads/2023/03/coinbase-wallet-logo.png" 
                                 alt="Coinbase Wallet" style="width: 30px; height: 30px;">
                        </a>
                    </div>
                `;
            }
        } catch (error) {
            console.error("Wallet connection error:", error);
            
            if (walletStatus) {
                walletStatus.innerHTML = `
                    <p style="color: #ff0000;">Connection error: ${error.message || "Unknown error"}</p>
                    <button id="retry-connect" style="margin-top: 10px;">Try Again</button>
                `;
                
                // Add retry button event listener
                const retryButton = document.getElementById('retry-connect');
                if (retryButton) {
                    retryButton.addEventListener('click', connect);
                }
            }
        }
    }
    
    /**
     * Connect to Ethereum wallet (MetaMask, Brave, Coinbase, etc.)
     */
    async function connectEthereumWallet() {
        try {
            let accounts = [];
            
            // Request accounts access - this will trigger the wallet popup
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            if (accounts && accounts.length > 0) {
                _walletAddress = accounts[0];
                _walletConnected = true;
                
                // Try to determine which wallet we connected to
                if (window.ethereum.isMetaMask) {
                    _providerName = "MetaMask";
                } else if (window.ethereum.isBraveWallet) {
                    _providerName = "Brave Wallet";
                } else if (window.ethereum.isCoinbaseWallet) {
                    _providerName = "Coinbase Wallet";
                } else {
                    _providerName = "Ethereum Wallet";
                }
                
                // Set up event listeners
                window.ethereum.on('accountsChanged', handleAccountsChanged);
                window.ethereum.on('disconnect', handleDisconnect);
                
                showSuccessMessage();
                return true;
            } else {
                throw new Error("No accounts returned from wallet");
            }
        } catch (error) {
            console.error("Ethereum wallet connection error:", error);
            
            // User rejected the connection
            if (error.code === 4001) {
                if (walletStatus) {
                    walletStatus.innerHTML = `
                        <p style="color: #ff0000;">Connection rejected. Please try again.</p>
                        <button id="retry-connect" style="margin-top: 10px;">Try Again</button>
                    `;
                    
                    // Add retry button event listener
                    const retryButton = document.getElementById('retry-connect');
                    if (retryButton) {
                        retryButton.addEventListener('click', connect);
                    }
                }
            } else {
                throw error; // Re-throw for the main catch block
            }
        }
    }
    
    /**
     * Connect to Solana wallet (Phantom, etc.)
     */
    async function connectSolanaWallet() {
        try {
            // Connect to Solana wallet
            const response = await window.solana.connect();
            
            if (response && response.publicKey) {
                _walletAddress = response.publicKey.toString();
                _walletConnected = true;
                
                // Determine provider name
                if (window.solana.isPhantom) {
                    _providerName = "Phantom";
                } else {
                    _providerName = "Solana Wallet";
                }
                
                // Set up event listeners
                window.solana.on('disconnect', handleDisconnect);
                
                showSuccessMessage();
                return true;
            } else {
                throw new Error("Invalid response from Solana wallet");
            }
        } catch (error) {
            console.error("Solana wallet connection error:", error);
            throw error; // Re-throw for the main catch block
        }
    }
    
    /**
     * Show success message after connecting
     */
    function showSuccessMessage() {
        // Show success message with provider name
        if (walletStatus) {
            walletStatus.innerHTML = `
                <p style="color: #00ff00;">${_providerName} connected!</p>
                <div id="wallet-address">${formatWalletAddress(_walletAddress)}</div>
            `;
        }
        
        // Show username input
        if (usernameContainer) {
            usernameContainer.style.display = 'block';
        }
        
        if (connectWalletBtn) {
            connectWalletBtn.style.display = 'none';
        }
        
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
            
            if (walletStatus) {
                walletStatus.innerHTML = `
                    <p style="color: #00ff00;">Switched to new wallet!</p>
                    <div id="wallet-address">${formatWalletAddress(_walletAddress)}</div>
                `;
            }
        }
    }
    
    /**
     * Handle wallet disconnection
     */
    function handleDisconnect() {
        console.log("Wallet disconnected");
        
        _walletConnected = false;
        _walletAddress = null;
        
        if (walletStatus) {
            walletStatus.innerHTML = `
                <p style="color: #ff0000;">Wallet disconnected. Please reconnect.</p>
            `;
        }
        
        if (usernameContainer) {
            usernameContainer.style.display = 'none';
        }
        
        if (connectWalletBtn) {
            connectWalletBtn.style.display = 'block';
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