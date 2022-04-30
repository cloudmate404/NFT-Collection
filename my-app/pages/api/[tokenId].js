// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// Base URI + TokenID
//for example
// Base URI = https://example.com/
// Token ID = 1
// tokenURI(1) = https://example.com/1

export default function handler(req, res) {
  // we need to first create a generic API endpoints

  // Dynamic API routes
  // first you need to rename the file in []

  const tokenId = req.query.tokenId;

  const name = `Crypto Dev #${tokenId}`;
  const description =
    "CryptoDevs is an NFT Collection for LearnWeb3 Developers ";
  // Because tokenId starts from 1 and our images start from 0 , we do Number(tokenId) - 1. We use Number to convert it to a number
  const image = `https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/${
    Number(tokenId) - 1
  }.svg`;

  // Then we return an object
  return res.json({
    name: name,
    description: description,
    image: image,
  });
}
