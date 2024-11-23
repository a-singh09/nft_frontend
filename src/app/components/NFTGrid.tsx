import { ethers } from "ethers";
import { NFTMarketplaceABI } from "../constants/abi";
import ConfirmationModal from './ConfirmationModal';
import { useState } from 'react';

interface NFTItem {
  tokenId: number;
  seller: string;
  owner: string;
  price: string;
  image: string;
  name: string;
  description: string;
  likes: number;
}

interface NFTGridProps {
  nfts: NFTItem[];
  onBuy: () => void;
}

export default function NFTGrid({ nfts, onBuy }: NFTGridProps) {
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);

  const buyNFT = async (tokenId: number, price: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS!,
        NFTMarketplaceABI,
        signer,
      );

      const transaction = await contract.createMarketSale(tokenId, {
        value: ethers.parseEther(price),
      });

      await transaction.wait();
      onBuy();
      setConfirmationOpen(true);
    } catch (error: any) {
      console.error("Error buying NFT:", error);
      let errorMessage = "Error buying NFT. Please try again.";
      
      if (error.code === "INSUFFICIENT_FUNDS") {
        errorMessage = "Insufficient funds to complete the purchase.";
      } else if (error.code === "ACTION_REJECTED") {
        errorMessage = "Transaction was rejected by the user.";
      } else if (error.reason) {
        errorMessage = `Error: ${error.reason}`;
      }
      
      alert(errorMessage);
    }
  };

  const likeNFT = async (tokenId: number) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS!,
        NFTMarketplaceABI,
        signer,
      );

      const transaction = await contract.likeNFT(tokenId);
      await transaction.wait();
      onBuy();
    } catch (error) {
      console.error("Error liking NFT:", error);
      alert("Error liking NFT. Please try again.");
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {nfts.map((nft) => (
        <div
          key={nft.tokenId}
          className="flex flex-col rounded-lg shadow-sm bg-white dark:bg-gray-800 overflow-hidden"
        >
          <div className="aspect-w-1 aspect-h-1">
            <img
              src={nft.image}
              alt={nft.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/next.svg";
                e.currentTarget.onerror = null;
              }}
            />
          </div>

          <div className="p-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {nft.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {nft.description}
            </p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                {nft.price} ETH
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => likeNFT(nft.tokenId)}
                  className="text-rose-600 hover:text-rose-700"
                >
                  ❤️ {nft.likes}
                </button>
                <button
                  onClick={() => buyNFT(nft.tokenId, nft.price)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        message="NFT purchased successfully!"
      />
    </div>
  );
}
