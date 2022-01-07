pragma solidity ^0.8.11;
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {
    struct Star {
        string name;
        string symbol;
        uint256 id;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;
    Star[] public stars;

    constructor() ERC721("StarNFT", "SNFT") {}

    function createStar(
        string memory _name,
        string memory _symbol,
        uint256 _tokenId
    ) external {
        Star memory newStar = Star(_name, _symbol, _tokenId);
        tokenIdToStarInfo[_tokenId] = newStar;
        stars.push(newStar);

        _mint(msg.sender, _tokenId);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) external {
        require(
            ownerOf(_tokenId) == msg.sender,
            "You can't sale the Star you don't own"
        );
        starsForSale[_tokenId] = _price;
    }

    function approveBuyer(address _buyer, uint256 _tokenId) external {
        approve(_buyer, _tokenId);
    }

    function buyStar(uint256 _tokenId) external payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        require(msg.value >= starCost, "You need to have enough Ether");
        address payable seller = payable(ownerOf(_tokenId));
        safeTransferFrom(seller, msg.sender, _tokenId); // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom

        // Send payment
        (bool paymentSent, ) = seller.call{value: starCost}("");
        require(paymentSent, "Failed to pay owner of token");

        if (msg.value > starCost) {
            // Return change
            uint256 change = msg.value - starCost;
            (bool changeSent, ) = payable(msg.sender).call{value: change}("");
            require(changeSent, "Failed to send change to buyer");
        }
    }

    function lookUptokenIdToStarInfo(uint256 _tokenId)
        external
        view
        returns (string memory)
    {
        return tokenIdToStarInfo[_tokenId].name;
    }

    function approveExchange(address _user) external {
        setApprovalForAll(_user, true);
    }

    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) external {
        address owner1 = ownerOf(_tokenId1);
        address owner2 = ownerOf(_tokenId2);
        require(msg.sender == owner1 || msg.sender == owner2, "Caller of function must be one one of the token owners");
        safeTransferFrom(owner1, owner2, _tokenId1);
        safeTransferFrom(owner2, owner1, _tokenId2);
    }

    function transferStar(address _to,uint256 _tokenId) external {
        safeTransferFrom(msg.sender, _to, _tokenId);
    }
}
