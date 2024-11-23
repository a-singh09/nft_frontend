# NFT Marketplace

This is a decentralized NFT Marketplace built with Next.js and Ethereum. Users can connect their wallets, view available NFTs, mint new NFTs, and purchase existing ones.

## Features

- Connect to MetaMask wallet
- View available NFTs in the marketplace
- Mint new NFTs with metadata
- Buy and like NFTs
- Responsive design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MetaMask browser extension

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/a-singh09/nft_frontend/
   cd nft_frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:

   Create a `.env` file in the root directory and add the following:

   ```env
   NEXT_PUBLIC_MARKETPLACE_ADDRESS=your_contract_address
   ```

4. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

- Connect your MetaMask wallet to interact with the marketplace.
- View available NFTs and their details.
- Mint new NFTs by filling out the form in the modal.
- Purchase NFTs by clicking the "Buy Now" button.

## Technologies Used

- **Next.js**: A React framework for server-side rendering and static site generation.
- **Ethereum**: A decentralized platform for building smart contracts.
- **Ethers.js**: A library for interacting with the Ethereum blockchain.
- **Tailwind CSS**: A utility-first CSS framework for styling.

## Challenges Faced

- Used newer version of Ethers.js (v6) which have some functions with different syntax.
- Got into issues with displaying the NFT images.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
