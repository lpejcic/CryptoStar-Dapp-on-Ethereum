// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721 {

    // Star data
    struct Star {
        string name;
    }

    constructor() ERC721("StarNotary", "STT") {}


    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;

    
    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public {
        Star memory newStar = Star(_name); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't owned");
        starsForSale[_tokenId] = _price;
    }


    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return payable(address(x));
    }

    function buyStar(uint256 _tokenId) public  payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You need to have enough Ether");
        transferFrom(ownerAddress, msg.sender, _tokenId);
        address payable ownerAddressPayable = _make_payable(ownerAddress); // We need to make this conversion to be able to use transfer() function to transfer ethers
        ownerAddressPayable.transfer(starCost);
        if(msg.value > starCost) {
            address payable senderAddressPayable = _make_payable(msg.sender);
            senderAddressPayable.transfer(msg.value - starCost);
        }
    }

    function lookUptokenIdToStarInfo (uint _tokenId) public view returns (string memory) {
        return tokenIdToStarInfo[_tokenId].name;
    }

    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        address ownerAddress1 = ownerOf(_tokenId1);
        address ownerAddress2 = ownerOf(_tokenId2);
        require(ownerAddress1 == msg.sender || ownerAddress2 == msg.sender, "Sender should own one of the STT");
        transferFrom(ownerAddress1, ownerAddress2, _tokenId1);
        transferFrom(ownerAddress2, ownerAddress1, _tokenId2);
    }

    function transferStar(address _to1, uint256 _tokenId) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the STT you don't own");
        transferFrom(msg.sender, _to1, _tokenId);
    }

}