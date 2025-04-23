// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RifaiNFTRewards is ERC721, AccessControl, ReentrancyGuard {
    // State
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 public _nextTokenId;
    string private _customBaseURI;
    mapping(address => bool) public nftRewarded;

    constructor(
        address defaultAdmin,
        address minter,
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, minter);
    }

    function _baseURI() internal view override returns (string memory) {
        return _customBaseURI;
    }

    function setBaseURI(
        string memory baseURI
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _customBaseURI = baseURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        return _customBaseURI;
    }

    function giveRewardNFT(address beneficiary) public onlyRole(MINTER_ROLE) {
        // Check if the campaign is valid
        require(!nftRewarded[beneficiary], "Beneficiary already rewarded.");
        // Mint the NFT
        uint256 tokenId = _nextTokenId++;
        _safeMint(beneficiary, tokenId);
        nftRewarded[beneficiary] = true;
    }

    // The following functions are overrides required by Solidity.
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
