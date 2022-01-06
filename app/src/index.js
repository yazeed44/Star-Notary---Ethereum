import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function () {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.account = accounts[0];
    } catch (error) {
      console.error(`Could not connect to contract or chain: ${error}`);
    }
  },

  setStatus: function (message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  createStar: async function () {
    const starName = document.getElementById("starName").value;
    const starId = Number(document.getElementById("starId").value);
    const starSymbol = document.getElementById("starSymbol").value;

    console.log(`Creating a new star with name ${starName} and id ${starId}`);

    await this.meta.methods.createStar(starName, starSymbol, starId).send({ from: this.account });
    App.setStatus("New Star Owner is " + this.account);
  },
  lookupStar: async function () {
    const starId = Number(document.getElementById("starIdQuery").value);
    console.log(`Looking up a star with id ${starId}`);

    const starName = await this.meta.methods.lookUptokenIdToStarInfo(starId).call();
    console.log(`The star name of id=${starId} is ${starName}`)
    document.getElementById("lookupStarName").innerHTML = `Star name is ${starName}`;
  }
};

window.App = App;

window.addEventListener("load", function () {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:7545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:7545"),
    );
  }

  App.start();
});
