"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import NFTGrid from "./components/NFTGrid";
import WalletConnect from "./components/WalletConnect";
import MintNFTModal from "./components/MintNFTModal";
import { NFTMarketplaceABI } from "./constants/abi";

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

export default function Marketplace() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMintModalOpen, setMintModalOpen] = useState(false);

  const fetchNFTs = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS!,
        NFTMarketplaceABI,
        provider,
      );

      const marketItems = await contract.fetchMarketItems();

      const items = await Promise.all(
        marketItems.map(async (item: any) => {
          try {
            const tokenURI = await contract.tokenURI(item.tokenId);
            let metadata;
            let imageUrl;

            if (tokenURI.startsWith("ipfs://")) {
              const ipfsGatewayUrl = "https://ipfs.io/ipfs/";
              const ipfsHash = tokenURI.replace("ipfs://", "");
              imageUrl = `${ipfsGatewayUrl}${ipfsHash}`; // Construct the image URL directly

              const response = await fetch(imageUrl);
              if (response.ok) {
                const contentType = response.headers.get("Content-Type");
                if (contentType && contentType.includes("application/json")) {
                  metadata = await response.json(); // Only if you need metadata
                }
              } else {
                console.error(
                  "Failed to fetch metadata from IPFS:",
                  response.statusText,
                );
                throw new Error("Failed to fetch metadata from IPFS");
              }
            } else if (tokenURI.startsWith("data:application/json;base64,")) {
              const base64Data = tokenURI.replace(
                "data:application/json;base64,",
                "",
              );
              const decodedData = atob(base64Data);
              
              metadata = JSON.parse(decodedData);
              
              imageUrl = metadata.file;
              
            } else {
              // Direct JSON or HTTP URL
              const response = await fetch(tokenURI);
              if (response.ok) {
                metadata = await response.json();
                imageUrl = metadata.image;
              } else {
                console.error("Failed to fetch metadata:", response.statusText);
                throw new Error("Failed to fetch metadata");
              }
            }

            return {
              tokenId: Number(item.tokenId),
              seller: item.seller,
              owner: item.owner,
              price: ethers.formatEther(item.price),
              image: imageUrl || "/next.svg",
              name: metadata?.name || `NFT #${item.tokenId}`,
              description: metadata?.description || "Metadata unavailable",
              likes: Number(item.likes),
            };
          } catch (error) {
            console.error(`Error processing NFT ${item.tokenId}:`, error);

            return {
              tokenId: Number(item.tokenId),
              seller: item.seller,
              owner: item.owner,
              price: ethers.formatEther(item.price),
              image: "/next.svg",
              name: `NFT #${item.tokenId}`,
              description: "Metadata unavailable",
              likes: Number(item.likes),
            };
          }
        }),
      );

      setNfts(items.filter((item) => item !== null));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      alert("Error fetching NFTs. Please check the console for details.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchNFTs();
    }
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            NFT Marketplace
          </h1>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <WalletConnect
              isConnected={isConnected}
              account={account}
              balance={balance}
              setIsConnected={setIsConnected}
              setAccount={setAccount}
              setBalance={setBalance}
            />
            {isConnected && (
              <button
                onClick={() => setMintModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700"
              >
                Mint NFT
              </button>
            )}
          </div>
        </div>

        {!isConnected ? (
          <div className="text-center py-12">
            <h2 className="text-xl text-gray-600 dark:text-gray-400">
              Please connect your wallet to view NFTs
            </h2>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Loading NFTs...
            </p>
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl text-gray-600 dark:text-gray-400">
              No NFTs available in the marketplace
            </h2>
          </div>
        ) : (
          <NFTGrid nfts={nfts} onBuy={fetchNFTs} />
        )}

        {isMintModalOpen && (
          <MintNFTModal
            isOpen={isMintModalOpen}
            onClose={() => setMintModalOpen(false)}
            onSuccess={() => {
              setMintModalOpen(false);
              fetchNFTs();
            }}
          />
        )}
      </div>
    </div>
  );
}
