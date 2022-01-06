const StarNotary = artifacts.require("StarNotary");

let accounts;
let owner;

contract("StarNotary", (accs) => {
  accounts = accs;
  owner = accounts[0];
});

it("Can create a star", async () => {
  const instance = await StarNotary.deployed();
  const firstTokenName = "Star One";
  const firstTokenSymbol = "STO";
  const firstTokenId = 3;
  await instance.createStar(firstTokenName, firstTokenSymbol, firstTokenId, { from: accounts[0] });
  const createdStar = await instance.tokenIdToStarInfo(firstTokenId);
  assert.equal(createdStar.name, firstTokenName);
});

it("Let user1 put up their star for sale", async () => {
  const instance = await StarNotary.deployed();
  const starName = "New star for sale";
  const starSymbol = "NEWS";
  const starId = 2;
  await instance.createStar(starName, starSymbol, starId, { from: accounts[0] });
  const starPrice = web3.utils.toWei(".01", "ether");
  await instance.putStarUpForSale(starId, starPrice, { from: owner });
  assert.equal(await instance.starsForSale.call(starId), starPrice);

});

it("Let user1 get the funds after the sale", async () => {
  const instance = await StarNotary.deployed();
  const buyer = accounts[1];
  const seller = accounts[0];
  const starId = 2;
  const starPrice = Number(web3.utils.toWei(".01", "ether"));
  await instance.approveBuyer(buyer, starId, { "from": seller });

  const sellerBalanceBeforeSelling = Number(await web3.eth.getBalance(seller));

  await instance.buyStar(starId, { "from": buyer, "value": starPrice });

  const sellerBalanceAfterSelling = Number(await web3.eth.getBalance(seller));

  assert.equal(sellerBalanceAfterSelling, sellerBalanceBeforeSelling + starPrice);
});

it("Make sure user2 is the owner of a star after buying", async () => {
  const instance = await StarNotary.deployed();
  const buyer = accounts[1];
  const starId = 2;

  const ownerOfStar = await instance.ownerOf.call(starId);

  assert.equal(ownerOfStar, buyer);

});

it("Let buyer buy a star and decrease its balance and ensure change is returned", async () => {
  const instance = await StarNotary.deployed();
  const seller = accounts[0], buyer = accounts[1];
  const starId = 6, starName = "Latest star", starSymbol = "LTS", starPrice = web3.utils.toBN(web3.utils.toWei(".01", "ether"));

  await instance.createStar(starName, starSymbol, starId, { from: seller });
  await instance.putStarUpForSale(starId, starPrice, { from: seller });

  await instance.approveBuyer(buyer, starId, { "from": seller });
  const buyerBalanceBeforeBuying = web3.utils.toBN(await web3.eth.getBalance(buyer));

  await instance.buyStar(starId, { from: buyer, value: starPrice * 2, gasPrice: 0 });
  const buyerBalanceAfterBuying = web3.utils.toBN(await web3.eth.getBalance(buyer));
  assert.equal(buyerBalanceAfterBuying, buyerBalanceBeforeBuying - starPrice)

});

it("Check if star name and token are added properly", async () => {
  const instance = await StarNotary.deployed();
  const starId = 7, starName = "To be checked star", starSymbol = "TBS";
  await instance.createStar(starName, starSymbol, starId, { from: accounts[1] });
  const star = await instance.tokenIdToStarInfo(starId);
  assert.equal(star.name, starName);
  assert.equal(star.symbol, starSymbol);
});

it("2 users can exchange their stars", async () => {
  const instance = await StarNotary.deployed();
  // Create star of user1
  const oneStarId = 8, oneStarName = "Star of user1", oneStarSymbol = "SOU1", oneAccount = accounts[0];
  await instance.createStar(oneStarName, oneStarSymbol, oneStarId, { "from": oneAccount });
  // Create star of user2
  const twoStarId = 9, twoStarName = "Star of user2", twoStarSymbol = "SOU2", twoAccount = accounts[1];
  await instance.createStar(twoStarName, twoStarSymbol, twoStarId, { "from": twoAccount });

  // Give approvals
  await instance.approveExchange(twoAccount, { from: oneAccount });
  await instance.approveExchange(oneAccount, { from: twoAccount });

  // Swap stars
  await instance.exchangeStars(oneAccount, twoAccount, { from: oneAccount });

  const ownerOfOne = await instance.ownerOf(oneStarId), ownerOfTwo = await instance.ownerOf(twoStarId);

  assert.equal(ownerOfOne, twoAccount);
  assert.equal(ownerOfTwo, oneAccount);
});

it("Transfer star tokens", async () => {
  const instance = await StarNotary.deployed();
  const starId = 10, starName = "Star to be transfered", starSymbol = "STBS";
  const transferer = accounts[0], transferee = accounts[1];
  await instance.createStar(starName, starSymbol, starId, {from: transferer});

  await instance.approveBuyer(transferee, starId, {from: transferer});
  await instance.transferStar(transferee, starId, {from: transferer});

  const ownerOfStar = await instance.ownerOf(starId);
  
  assert.equal(ownerOfStar, transferee);
});
