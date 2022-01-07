const HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config();
module.exports = {

  networks: {

    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },

    // Useful for deploying to a public network.
    // NB: It's important to wrap the provider as a function.
    rinkeby: {
      provider: () =>
        new HDWalletProvider(
          process.env.PRIVATE_KEY,
          `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`
        ),
      network_id: 4, // rinkeby's id
      gas: 4500000, // rinkeby has a lower block limit than mainnet
      gasPrice: 10000000000,
    },
  },

  compilers: {
    solc: {
      version: "^0.8.11",    // Fetch exact version from solc-bin (default: truffle's version)
    }
  }
}
