  // SPDX-License-Identifier: MIT
  pragma solidity ^0.8.4;

  import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
  import "@openzeppelin/contracts/access/Ownable.sol";
  import "./IWhitelist.sol";

  contract CryptoDevs is ERC721Enumerable, Ownable {

        /**
       * @dev _baseTokenURI for computing {tokenURI}. If set, the resulting URI for each
       * token will be the concatenation of the `baseURI` and the `tokenId`.
       */
      string _baseTokenURI;

    // Whitelist contract instance
      IWhitelist whitelist;


    bool public presaleStarted;

    uint public presaleEnded;

    uint public maxTokenIds = 20;

    uint public tokenIds;

    uint public _price = 0.0005 ether;

    bool public _paused;

    modifier onlyWhenNotPaused{
        require(!_paused, "Contract is paused");
        _;
    }

     /**
       * @dev ERC721 constructor takes in a `name` and a `symbol` to the token collection.
       * name in our case is `Crypto Devs` and symbol is `CD`.
       * Constructor for Crypto Devs takes in the baseURI to set _baseTokenURI for the collection.
       * It also initializes an instance of whitelist interface.
       */
      constructor(string memory baseURI, address whitelistContract) ERC721("Crypto Devs", "CD"){
          _baseTokenURI =  baseURI;
          whitelist = IWhitelist(whitelistContract);
      }

      function startPresale() public onlyOwner {
          presaleStarted = true;
          presaleEnded = block.timestamp + 5 minutes;
      }

      function presaleMint() public payable onlyWhenNotPaused {
          require(presaleStarted && block.timestamp < presaleEnded, "Presale has ended");
          require(whitelist.whitelistedAddresses(msg.sender), "You are not in the whitelist");
          require(tokenIds < maxTokenIds, "Exceeded the limit");
          require(msg.value >= _price, "You need to send more ether");

          tokenIds += 1;

          _safeMint(msg.sender, tokenIds);
      }

      function mint() public payable onlyWhenNotPaused{
          require(presaleStarted && block.timestamp >= presaleEnded, "Presale has not ended yet");
          require(tokenIds < maxTokenIds, "Exceeded the limit");
          require(msg.value >= _price, "You need to send more ether");

           tokenIds += 1;

          _safeMint(msg.sender, tokenIds);

      }

      function _baseURI() internal view virtual override returns (string memory) {
          return _baseTokenURI;
      }

      function setPaused(bool val) public onlyOwner {
          _paused = val;
      }






      function withdraw() public onlyOwner {
          address _owner = owner();
          uint amount = address(this).balance;
          (bool sent, ) = _owner.call{value: amount}("");
          require(sent, "Failed to send Ether");
      }

      receive() external payable{}

      fallback() external payable{}

  }