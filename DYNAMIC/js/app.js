/**
 * Main application file for TropiChat
 * Initializes all modules and handles their interactions
 */
(function() {
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
        
        console.log(`${CONFIG.APP_NAME} initialization complete.`);
    }
    
    /**
     * Callback for when wallet is connected
     * @param {String} address - Wallet address
     */
    function onWalletConnected(address) {
        console.log(`Wallet connected: ${address}`);
        
        // You can add additional functionality here when wallet connects
        // For example, fetching user profile from a database if they've used this wallet before
    }
    
})();