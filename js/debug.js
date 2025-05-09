/**
 * Debug console for TropiChat
 * Helps troubleshoot wallet connection issues
 */
const debug = (function() {
    // Private variables
    let _isVisible = false;
    let _logHistory = [];
    let _consoleElement = null;
    
    /**
     * Initialize debug module
     */
    function init() {
        // Create debug console element
        createDebugConsole();
        
        // Override console.log to also show in debug console
        interceptConsoleLog();
        
        // Log initial system info
        logSystemInfo();
    }
    
    /**
     * Create debug console element
     */
    function createDebugConsole() {
        // Create console container
        _consoleElement = document.createElement('div');
        _consoleElement.className = 'debug-console';
        _consoleElement.style.display = 'none';
        
        // Add toggle button
        const toggleButton = document.createElement('button');
        toggleButton.className = 'debug-toggle';
        toggleButton.textContent = 'Debug';
        toggleButton.onclick = toggleConsole;
        document.body.appendChild(toggleButton);
        
        // Create console header
        const header = document.createElement('div');
        header.className = 'debug-header';
        header.innerHTML = '<h3>Debug Console</h3><button id="debug-close">×</button>';
        _consoleElement.appendChild(header);
        
        // Add close button event
        header.querySelector('#debug-close').onclick = toggleConsole;
        
        // Create console output area
        const output = document.createElement('div');
        output.className = 'debug-output';
        _consoleElement.appendChild(output);
        
        // Create console input
        const input = document.createElement('div');
        input.className = 'debug-input';
        input.innerHTML = '<input type="text" id="debug-command" placeholder="Enter debug command...">' +
                         '<button id="debug-run">Run</button>';
        _consoleElement.appendChild(input);
        
        // Add run button event
        input.querySelector('#debug-run').onclick = runCommand;
        input.querySelector('#debug-command').onkeypress = function(e) {
            if (e.key === 'Enter') {
                runCommand();
            }
        };
        
        // Add console to body
        document.body.appendChild(_consoleElement);
        
        // Add styles
        addStyles();
    }
    
    /**
     * Add styles for debug console
     */
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .debug-toggle {
                position: fixed;
                bottom: 10px;
                right: 10px;
                background-color: #ff00ff;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 5px 10px;
                font-size: 12px;
                cursor: pointer;
                z-index: 1000;
                opacity: 0.7;
            }
            .debug-toggle:hover {
                opacity: 1;
            }
            .debug-console {
                position: fixed;
                bottom: 40px;
                right: 10px;
                width: 400px;
                height: 300px;
                background-color: rgba(0, 0, 0, 0.9);
                border: 1px solid #00ffff;
                border-radius: 5px;
                color: #00ff00;
                font-family: monospace;
                display: flex;
                flex-direction: column;
                z-index: 1000;
            }
            .debug-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 5px 10px;
                background-color: #000066;
                border-bottom: 1px solid #00ffff;
            }
            .debug-header h3 {
                margin: 0;
                font-size: 14px;
                color: #ffcc00;
            }
            .debug-header button {
                background: none;
                border: none;
                color: #ffffff;
                font-size: 18px;
                cursor: pointer;
            }
            .debug-output {
                flex: 1;
                padding: 10px;
                overflow-y: auto;
                font-size: 12px;
            }
            .debug-input {
                display: flex;
                padding: 5px;
                border-top: 1px solid #00ffff;
            }
            .debug-input input {
                flex: 1;
                background-color: #000033;
                border: 1px solid #00ffff;
                color: #ffffff;
                padding: 5px;
                font-family: monospace;
            }
            .debug-input button {
                background-color: #ff00ff;
                color: white;
                border: none;
                padding: 5px 10px;
                margin-left: 5px;
                cursor: pointer;
            }
            .debug-log {
                margin-bottom: 5px;
                word-wrap: break-word;
            }
            .debug-log-info {
                color: #00ffff;
            }
            .debug-log-error {
                color: #ff0000;
            }
            .debug-log-warn {
                color: #ffcc00;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Toggle debug console visibility
     */
    function toggleConsole() {
        _isVisible = !_isVisible;
        _consoleElement.style.display = _isVisible ? 'flex' : 'none';
    }
    
    /**
     * Run debug command
     */
    function runCommand() {
        const commandInput = document.querySelector('#debug-command');
        const command = commandInput.value.trim();
        
        if (!command) return;
        
        // Log command
        log('> ' + command, 'command');
        
        // Process command
        try {
            if (command === 'clear') {
                clearConsole();
            } else if (command === 'info') {
                logSystemInfo();
            } else if (command === 'detect') {
                if (wallet && typeof wallet.getAvailableProviders === 'function') {
                    const providers = wallet.getAvailableProviders();
                    log('Detected wallet providers: ' + (providers.length ? providers.join(', ') : 'none'), 'info');
                } else {
                    log('Wallet module not available or missing getAvailableProviders method', 'error');
                }
            } else if (command === 'connect') {
                if (wallet && typeof wallet.connect === 'function') {
                    log('Trying to connect wallet...', 'info');
                    wallet.connect();
                } else {
                    log('Wallet module not available or missing connect method', 'error');
                }
            } else if (command === 'help') {
                log('Available commands:', 'info');
                log('  help - Show this help', 'info');
                log('  clear - Clear console', 'info');
                log('  info - Show system info', 'info');
                log('  detect - Detect wallet providers', 'info');
                log('  connect - Try to connect wallet', 'info');
                log('  localStorage - Show localStorage items', 'info');
            } else if (command === 'localStorage') {
                logLocalStorage();
            } else {
                // Try to evaluate the command
                const result = eval(command);
                log('Result: ' + JSON.stringify(result), 'info');
            }
        } catch (error) {
            log('Error: ' + error.message, 'error');
        }
        
        // Clear input
        commandInput.value = '';
        commandInput.focus();
    }
    
    /**
     * Clear console
     */
    function clearConsole() {
        const output = document.querySelector('.debug-output');
        if (output) {
            output.innerHTML = '';
        }
        _logHistory = [];
    }
    
    /**
     * Intercept console.log to also show in debug console
     */
    function interceptConsoleLog() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.log = function() {
            originalLog.apply(console, arguments);
            const message = Array.from(arguments).map(arg => {
                if (typeof arg === 'object') {
                    return JSON.stringify(arg);
                }
                return arg;
            }).join(' ');
            log(message, 'log');
        };
        
        console.error = function() {
            originalError.apply(console, arguments);
            const message = Array.from(arguments).map(arg => {
                if (typeof arg === 'object') {
                    return JSON.stringify(arg);
                }
                return arg;
            }).join(' ');
            log(message, 'error');
        };
        
        console.warn = function() {
            originalWarn.apply(console, arguments);
            const message = Array.from(arguments).map(arg => {
                if (typeof arg === 'object') {
                    return JSON.stringify(arg);
                }
                return arg;
            }).join(' ');
            log(message, 'warn');
        };
    }
    
    /**
     * Log message to debug console
     * @param {String} message - Message to log
     * @param {String} type - Log type (log, error, warn, info, command)
     */
    function log(message, type = 'log') {
        // Add to log history
        _logHistory.push({
            message,
            type,
            timestamp: new Date()
        });
        
        // Update console if visible
        const output = document.querySelector('.debug-output');
        if (output) {
            const logElement = document.createElement('div');
            logElement.className = 'debug-log debug-log-' + type;
            logElement.textContent = message;
            output.appendChild(logElement);
            
            // Scroll to bottom
            output.scrollTop = output.scrollHeight;
        }
    }
    
    /**
     * Log system information
     */
    function logSystemInfo() {
        log('System Information:', 'info');
        log('Browser: ' + navigator.userAgent, 'info');
        log('Window Ethereum: ' + (typeof window.ethereum !== 'undefined'), 'info');
        log('Window Solana: ' + (typeof window.solana !== 'undefined'), 'info');
        
        // Check if window.ethereum has specific properties
        if (typeof window.ethereum !== 'undefined') {
            try {
                log('isMetaMask: ' + (window.ethereum.isMetaMask || false), 'info');
                log('isBraveWallet: ' + (window.ethereum.isBraveWallet || false), 'info');
                log('isCoinbaseWallet: ' + (window.ethereum.isCoinbaseWallet || false), 'info');
            } catch (e) {
                log('Error checking window.ethereum properties: ' + e.message, 'error');
            }
        }
        
        // Check if window.solana has specific properties
        if (typeof window.solana !== 'undefined') {
            try {
                log('isPhantom: ' + (window.solana.isPhantom || false), 'info');
            } catch (e) {
                log('Error checking window.solana properties: ' + e.message, 'error');
            }
        }
    }
    
    /**
     * Log localStorage items
     */
    function logLocalStorage() {
        log('localStorage items:', 'info');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            let value = localStorage.getItem(key);
            
            // Try to parse JSON
            try {
                value = JSON.parse(value);
                value = JSON.stringify(value);
            } catch (e) {
                // Keep as string if not JSON
            }
            
            log(`${key}: ${value}`, 'info');
        }
    }
    
    // Public API
    return {
        init,
        log,
        toggleConsole,
        clearConsole
    };
})();

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    debug.init();
});