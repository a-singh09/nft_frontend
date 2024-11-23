import { useState } from "react";
import { ethers } from "ethers";
import { NFTMarketplaceABI } from "../constants/abi";

interface MintNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MintNFTModal({
  isOpen,
  onClose,
  onSuccess,
}: MintNFTModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0.025");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const LISTING_PRICE = ethers.parseEther("0.0025"); // From contract

  const mintNFT = async () => {
    try {
      if (!name || !description || !price || !file) {
        alert("Please fill in all fields");
        return;
      }

      if (parseFloat(price) <= 0) {
        alert("Price must be greater than 0");
        return;
      }

      setLoading(true);

      const metadata = {
        name,
        description,
        Image,
      };

      const metadataString = JSON.stringify(metadata);
      const tokenURI = `data:application/json;base64,${Buffer.from(metadataString).toString("base64")}`;

      const tokenURISize = new Blob([tokenURI]).size;
      if (tokenURISize > 100000) {
        alert(
          "Image is too large. Please choose a smaller image or reduce its quality.",
        );
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS!,
        NFTMarketplaceABI,
        signer,
      );

      const balance = await provider.getBalance(await signer.getAddress());
      if (balance < LISTING_PRICE) {
        alert(
          `Insufficient funds. You need at least 0.025 ETH to mint an NFT.`,
        );
        return;
      }

      const transaction = await contract.mintToken(
        tokenURI,
        ethers.parseEther("0.0025"),
        {
          value: LISTING_PRICE,
          gasLimit: 2000000,
        },
      );

      await transaction.wait();

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Detailed error:", error);
      let errorMessage = "Error minting NFT. Please check the console for details.";
      
      if (error.code === "INSUFFICIENT_FUNDS") {
        errorMessage = "Insufficient funds to cover gas and listing price.";
      } else if (error.code === "ACTION_REJECTED") {
        errorMessage = "Transaction was rejected by the user.";
      } else if (error.reason) {
        errorMessage = `Error: ${error.reason}`;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="relative bg-white rounded-lg max-w-lg w-full p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Mint New NFT
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-600 focus:border-rose-500 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-600 focus:border-rose-500 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price (ETH)
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-600 focus:border-rose-500 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Image (Max 5MB)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      alert("File size must be less than 5MB");
                      e.target.value = "";
                      return;
                    }
                    setFile(file);
                  }
                }}
                className="mt-1 block w-full"
              />
              {file && (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="mt-2 h-32 w-32 object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={mintNFT}
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50"
            >
              {loading ? "Minting..." : "Mint NFT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}