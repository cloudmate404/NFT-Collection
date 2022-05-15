import { useRef, useState, useEffect } from "react";
import { providers, Contract, utils } from "ethers";
import Web3Modal from "web3modal";
import styles from "../styles/Home.module.css";
import Head from "next/head";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from "../constants";

export default function Home() {
  // 1. YOU WANT USERS TO BE ABLE TO CONNECT THEIR WALLETS
  // 2. ALLOW OWNER TO START PRESALE // we need a fucntion to start presale and a function to check if presale started
  // 3. WE ALSO NEED TO CHECK IF PRESALE HAS ENDED BECAUSE DEPENDING ON THAT WE WILL EITHER DISPLAY PRESALE MINT FUNC OR REGULAR SALE FUNC
  // 4. WE NEED TO HAVE A FUNCTION TO MINT TOKENS, BOTH PRESALE AND PUBLIC
  // 5. WE NEED TO KNOW HOW MANY NFTS HAVE BEEN MINTED

  // 2. check if owner is connected
  const [isOwner, setIsOwner] = useState(false);
  // 2. Keep track of PresaleStart
  const [presaleStarted, setPresaleStarted] = useState(false);

  // 3. Keep track of PresaleEnded
  const [presaleEnded, setPresaleEnded] = useState(false);

  // 1. To keep track if the user has connected their wallet
  const [walletConnected, setWalletConnected] = useState(false);

  // Good practice
  const [loading, setLoading] = useState(false);

  // 5. Keep track of number of token Ids Minted
  const [numTokenMinted, setNumTokenMinted] = useState("");

  // 1. create a reference to web3 instance with web3Modal
  const web3ModalRef = useRef();

  // 5. A Function to show how many NFTs have been minted
  const getNumMintedTokens = async () => {
    try {
      const provider = await getProviderOrSigner();

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      // Since this is a uint256, it will return a BigNumber
      const numTokenIds = await nftContract.tokenIds();
      setNumTokenMinted(numTokenIds.toString());
    } catch (error) {
      console.error(error);
    }
  };

  // 4. Presale mint function
  const presaleMint = async () => {
    setLoading(true);
    try {
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      // we do not need to pass an argument to the function but we need to pass it an ethereum value
      const tx = await nftContract.presaleMint({
        // the value should be in wei since ethereum doesnt allow decimals
        // its just better to import utils from ethers
        value: utils.parseEther("0.001"),
      });
      await tx.wait();
      window.alert("CryptoDev minted successfully, Congratulations 🎈 ");
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  // 4. Public mint function
  const publicMint = async () => {
    setLoading(true);
    try {
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const tx = await nftContract.mint({
        value: utils.parseEther("0.001"),
      });
      await tx.wait();
      window.alert("CryptoDev minted successfully, Congratulations 🎈 ");
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  // 2. helper function to getOwner
  const getOwner = async () => {
    try {
      // get signer in this case because you need to write the state of the blockchain
      const signer = await getProviderOrSigner(true);

      // Get an instance of your NFT Contract // we need contract address and contractABI and provider
      // You need to import Contract from ethers to access the Contract instance
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      // Address of the owner of the contract
      const owner = await nftContract.owner();
      // Address of the user currently connected to the DAPP
      const userAddress = await signer.getAddress();

      if (owner.toLowerCase() === userAddress.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 2. function to start presale
  const startPresale = async () => {
    setLoading(true);

    try {
      // get signer in this case because you need to write the state of the blockchain
      const signer = await getProviderOrSigner(true);

      // Get an instance of your NFT Contract // we need contract address and contractABI and signer
      // You need to import Contract from ethers to access the Contract instance
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const txn = await nftContract.startPresale();
      await txn.wait();

      setPresaleStarted(true);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  // 3. function to check if presale ended
  const checkIfPresaleEnded = async () => {
    try {
      // get getProviderOrSigner
      const provider = await getProviderOrSigner();

      // Get an instance of your NFT Contract // we need contract address and contractABI and provider
      // You need to import Contract from ethers to access the Contract instance
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      // This will return a BigNumber because presaleEnded is a uint256
      // This will return a timestamp in seconds
      const presaleEndTime = await nftContract.presaleEnded();
      // we need current time and Date.now returns timestamp in milliseconds so we need to divide it by 1000
      const currentTimeInSeconds = Date.now() / 1000;

      // Since it returns a BigNumber we can't use <, we need to use BigNumber function for < "lt()" and since it is being divided by 1000 it can give a float value so we need to floor it
      const hasPresaleEnded = presaleEndTime.lt(
        Math.floor(currentTimeInSeconds)
      );

      setPresaleEnded(hasPresaleEnded);
    } catch (error) {
      console.error(error);
    }
  };

  // 2. function to check if presale started
  const checkIfPresaleStarted = async () => {
    try {
      // get getProviderOrSigner
      const provider = await getProviderOrSigner();

      // Get an instance of your NFT Contract // we need contract address and contractABI and provider
      // You need to import Contract from ethers to access the Contract instance
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      // Check if presale started
      const isPresaleStarted = await nftContract.presaleStarted();
      setPresaleStarted(isPresaleStarted);

      return isPresaleStarted;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // 1. function to connect to wallet
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();

      // Update walletConnected state to true
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  // 1. Helper function to get providerOrSigner
  const getProviderOrSigner = async (needSigner = false) => {
    // We need to gain access to the provider/signer from Metamask
    // This line itself will pop open metamask and ask the user to connect their wallet
    const provider = await web3ModalRef.current.connect();

    // To gain access to some nice features that ethersjs has we wrap the provider in an ethers.provider
    const web3Provider = new providers.Web3Provider(provider);

    // If the users are NOT connected to Rinkeby, we need to tell them to switch to Rinkeby
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Please switch to the Goerli test network");
      // Then you throw an error so the code does NOT progress
      throw new Error("Please switch to the Goerli test network");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  // 1. we use this because, useEffect isn't asynchronous, because useEffect loads faster than useState. So we need all the functions in onPAgeLoad to be asynchronous before calling it in useEffect while the page loads for the first time.
  const onPageLoad = async () => {
    await connectWallet();
    await getOwner();
    const presaleStarted = await checkIfPresaleStarted();
    if (presaleStarted) {
      await checkIfPresaleEnded();
    }

    await getNumMintedTokens();

    // 6. Track in real time the number of minted NFTs
    setInterval(async () => {
      await getNumMintedTokens();
    }, 5 * 1000);

    // 6. Track in real time the status of presale (started or ended)
    setInterval(async () => {
      const presaleStarted = await checkIfPresaleStarted();
      if (presaleStarted) {
        await checkIfPresaleEnded();
      }
    }, 5 * 1000);
  };

  // 1. To initialize the web3ModalRef when the website loads
  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      onPageLoad();
    }
  }, []);

  function renderBody() {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your Wallet
        </button>
      );
    }

    if (loading) {
      return <span className={styles.description}>Loading...</span>;
    }

    if (isOwner && !presaleStarted) {
      // render a button to start the presale
      return (
        <button onClick={startPresale} className={styles.button}>
          Start Presale
        </button>
      );
    }

    if (!presaleStarted) {
      // Just say presale hasn't started yet
      return (
        <div className="">
          <h4 className={styles.description}>
            Presale has not started yet. Come back later!
          </h4>
        </div>
      );
    }

    if (presaleStarted && !presaleEnded) {
      // allow users to mint in presale
      // they need to be in whitelist for this to work
      return (
        <div className="flex">
          <h4 className={styles.description}>
            Presale has started! If your address is whitelisted, you can mint a
            CryptoDev!
          </h4>
          <button className={styles.button} onClick={presaleMint}>
            Presale Mint 🚀
          </button>
        </div>
      );
    }

    if (presaleEnded) {
      // allow users to take part in public mint
      return (
        <div className="flex">
          <h4 className={styles.description}>
            Presale has ended!. You can mint a CryptoDev in public sale, if any
            remain
          </h4>
          <button className={styles.button} onClick={publicMint}>
            Public Mint 🚀
          </button>
        </div>
      );
    }
  }

  return (
    <div>
      <Head>
        <title>Crypto Devs NFT</title>
      </Head>

      <div className={styles.main}>
        <div className={styles.flex}>
          <h1 className={styles.title}>Welcome to CryptoDevs NFT</h1>
          <span className={styles.description}>
            CryptoDevs NFT is a collection for developers in web3
          </span>
          <h4 className={styles.description}>
            {numTokenMinted}/20 have been minted already
          </h4>
          {renderBody()}
        </div>
        <img
          className={styles.image}
          src="/cryptodevs/0.svg"
          alt="CryptoDevs NFT"
        />
      </div>
    </div>
  );
}
