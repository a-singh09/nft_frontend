import { ethers } from "ethers";
import { useEffect } from "react";

interface WalletConnectProps {
  isConnected: boolean;
  account: string;
  balance: string;
  setIsConnected: (connected: boolean) => void;
  setAccount: (account: string) => void;
  setBalance: (balance: string) => void;
}

export default function WalletConnect({
  isConnected,
  account,
  balance,
  setIsConnected,
  setAccount,
  setBalance,
}: WalletConnectProps) {
  // Check if MetaMask is installed
  const checkIfWalletIsConnected = async () => {
    try {
      if (typeof window.ethereum === "undefined") {
        console.log("Please install MetaMask!");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(accounts[0]);
        setAccount(accounts[0]);
        setBalance(ethers.formatEther(balance));
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAccount("");
      setBalance("");
    } else {
      setAccount(accounts[0]);
      checkIfWalletIsConnected();
    }
  };

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      checkIfWalletIsConnected();
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged,
        );
      }
    };
  }, []);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === "undefined") {
        alert("Please install MetaMask to connect your wallet!");

        window.open("https://metamask.io/download/", "_blank");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(accounts[0]);

      setAccount(accounts[0]);
      setBalance(ethers.formatEther(balance));
      setIsConnected(true);
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      if (error.code === 4001) {
        alert("Please connect your wallet to continue.");
      } else {
        alert("Error connecting wallet. Please try again.");
      }
    }
  };

  return (
    <div className="flex items-center gap-4">
      {isConnected ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            ({parseFloat(balance).toFixed(4)} ETH)
          </span>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
