// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title NFT
 * @dev ERC721 NFT with whitelist, royalties, and reveal functionality
 * @custom:security-contact security@example.com
 */
contract NFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Pausable,
    ERC721Royalty,
    Ownable,
    ReentrancyGuard
{
    uint256 public constant MAX_SUPPLY = 10_000;
    uint256 public constant MAX_PER_WALLET = 5;

    uint256 public mintPrice = 0.08 ether;
    uint256 public whitelistPrice = 0.05 ether;

    string public baseURI;
    string public hiddenMetadataURI;

    bool public revealed;
    bool public publicMintEnabled;
    bool public whitelistMintEnabled;

    bytes32 public merkleRoot;

    uint256 private _tokenIdCounter;

    mapping(address => uint256) public mintedPerWallet;

    event Revealed(string baseURI);
    event MintPriceUpdated(uint256 newPrice);
    event WhitelistPriceUpdated(uint256 newPrice);
    event MerkleRootUpdated(bytes32 newRoot);

    error MaxSupplyReached();
    error MaxPerWalletExceeded();
    error InsufficientPayment();
    error PublicMintDisabled();
    error WhitelistMintDisabled();
    error NotWhitelisted();
    error WithdrawFailed();

    constructor(
        string memory name,
        string memory symbol,
        string memory _hiddenMetadataURI,
        uint96 royaltyFee // Basis points (e.g., 500 = 5%)
    ) ERC721(name, symbol) Ownable(msg.sender) {
        hiddenMetadataURI = _hiddenMetadataURI;
        _setDefaultRoyalty(msg.sender, royaltyFee);
    }

    // ============ Minting ============

    /**
     * @dev Public mint
     * @param quantity Number of NFTs to mint
     */
    function mint(uint256 quantity) external payable nonReentrant {
        if (!publicMintEnabled) revert PublicMintDisabled();
        if (_tokenIdCounter + quantity > MAX_SUPPLY) revert MaxSupplyReached();
        if (mintedPerWallet[msg.sender] + quantity > MAX_PER_WALLET) revert MaxPerWalletExceeded();
        if (msg.value < mintPrice * quantity) revert InsufficientPayment();

        mintedPerWallet[msg.sender] += quantity;

        for (uint256 i = 0; i < quantity; i++) {
            _safeMint(msg.sender, _tokenIdCounter);
            _tokenIdCounter++;
        }
    }

    /**
     * @dev Whitelist mint with merkle proof
     * @param quantity Number of NFTs to mint
     * @param merkleProof Proof of whitelist inclusion
     */
    function whitelistMint(
        uint256 quantity,
        bytes32[] calldata merkleProof
    ) external payable nonReentrant {
        if (!whitelistMintEnabled) revert WhitelistMintDisabled();
        if (_tokenIdCounter + quantity > MAX_SUPPLY) revert MaxSupplyReached();
        if (mintedPerWallet[msg.sender] + quantity > MAX_PER_WALLET) revert MaxPerWalletExceeded();
        if (msg.value < whitelistPrice * quantity) revert InsufficientPayment();

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        if (!MerkleProof.verify(merkleProof, merkleRoot, leaf)) revert NotWhitelisted();

        mintedPerWallet[msg.sender] += quantity;

        for (uint256 i = 0; i < quantity; i++) {
            _safeMint(msg.sender, _tokenIdCounter);
            _tokenIdCounter++;
        }
    }

    /**
     * @dev Owner mint (free, for team/giveaways)
     * @param to Address to mint to
     * @param quantity Number of NFTs to mint
     */
    function ownerMint(address to, uint256 quantity) external onlyOwner {
        if (_tokenIdCounter + quantity > MAX_SUPPLY) revert MaxSupplyReached();

        for (uint256 i = 0; i < quantity; i++) {
            _safeMint(to, _tokenIdCounter);
            _tokenIdCounter++;
        }
    }

    // ============ Admin Functions ============

    function reveal(string memory _baseURI) external onlyOwner {
        revealed = true;
        baseURI = _baseURI;
        emit Revealed(_baseURI);
    }

    function setMintPrice(uint256 _price) external onlyOwner {
        mintPrice = _price;
        emit MintPriceUpdated(_price);
    }

    function setWhitelistPrice(uint256 _price) external onlyOwner {
        whitelistPrice = _price;
        emit WhitelistPriceUpdated(_price);
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
        emit MerkleRootUpdated(_merkleRoot);
    }

    function setPublicMintEnabled(bool _enabled) external onlyOwner {
        publicMintEnabled = _enabled;
    }

    function setWhitelistMintEnabled(bool _enabled) external onlyOwner {
        whitelistMintEnabled = _enabled;
    }

    function setHiddenMetadataURI(string memory _uri) external onlyOwner {
        hiddenMetadataURI = _uri;
    }

    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        if (!success) revert WithdrawFailed();
    }

    // ============ View Functions ============

    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        if (!revealed) {
            return hiddenMetadataURI;
        }
        return string(abi.encodePacked(baseURI, Strings.toString(tokenId), ".json"));
    }

    // ============ Required Overrides ============

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable, ERC721Pausable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Royalty)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
