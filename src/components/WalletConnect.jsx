import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, AlertCircle, CheckCircle, Zap } from 'lucide-react';

const WalletConnect = ({ onWalletConnected, onWalletDisconnected }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // Check if wallet is already connected
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          onWalletConnected?.(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask not detected. Please install MetaMask!');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        setIsConnected(true);
        onWalletConnected?.(address);
        
        // Switch to GenLayer Studio network (if needed)
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xF1CF' }], // GenLayer Studio (61999 in hex)
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0xF1CF',
                  chainName: 'GenLayer Studio',
                  rpcUrls: ['http://studio.genlayer.com/api'],
                  nativeCurrency: {
                    name: 'GEN',
                    symbol: 'GEN',
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://explorer-studio.genlayer.com'],
                },
              ],
            });
          }
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
    setIsConnected(false);
    onWalletDisconnected?.();
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Futuristic glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
      
      <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Zap className="w-6 h-6 text-cyan-400" />
          </motion.div>
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Connect Wallet
          </span>
        </h2>

        {!isConnected ? (
          <div className="space-y-4">
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-cyan-500/50"
              >
                <Wallet className="w-10 h-10 text-cyan-400" />
              </motion.div>
              <p className="text-gray-300 mb-4">
                Connect your wallet to access the blockchain
              </p>
              <p className="text-sm text-gray-400 mb-2">
                Powered by GenLayer Studio
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400"
              >
                <AlertCircle className="w-4 h-4 inline mr-2" />
                {error}
              </motion.div>
            )}

            <motion.button
              onClick={connectWallet}
              disabled={isConnecting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400 text-white font-bold py-3 px-6 rounded-xl border border-cyan-400/50 shadow-lg shadow-cyan-500/25 transition-all duration-300"
            >
              {isConnecting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Wallet className="w-5 h-5" />
                  <span>Connect Wallet</span>
                </div>
              )}
            </motion.button>

            <div className="text-center text-sm text-gray-400 mt-4">
              <p>Don't have a wallet?</p>
              <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
              >
                Download MetaMask
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-green-500/50"
              >
                <CheckCircle className="w-10 h-10 text-green-400" />
              </motion.div>
              <p className="text-green-400 font-semibold mb-2 text-lg">
                Wallet Connected!
              </p>
              <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-cyan-400 border border-cyan-500/30">
                {formatAddress(walletAddress)}
              </div>
            </div>

            <motion.button
              onClick={disconnectWallet}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white font-bold py-3 px-6 rounded-xl border border-red-400/50 shadow-lg shadow-red-500/25 transition-all duration-300"
            >
              <div className="flex items-center justify-center gap-2">
                <Wallet className="w-5 h-5" />
                <span>Disconnect</span>
              </div>
            </motion.button>

            <div className="text-center text-sm text-gray-400 mt-4 space-y-1">
              <p className="text-cyan-400">Network: GenLayer Studio</p>
              <p className="text-xs">Connected via Web3</p>
              <p className="text-xs text-purple-400">
                ⚡ Powered by GenLayer
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WalletConnect;
export { WalletConnect };
