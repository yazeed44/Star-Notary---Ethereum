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

    function exchangeStars(address _user1, address _user2) external {
        for (uint256 i = 0; i < stars.length; i++)
            if (ownerOf(stars[i].id) == _user1)
                safeTransferFrom(_user1, _user2, stars[i].id);
            else if (ownerOf(stars[i].id) == _user2)
                safeTransferFrom(_user2, _user1, stars[i].id);
    }

    function transferStar(address _to,uint256 _tokenId) external {
        safeTransferFrom(msg.sender, _to, _tokenId);
    }
}
