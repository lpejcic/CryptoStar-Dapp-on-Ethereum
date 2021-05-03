const StarNotary = artifacts.require("StarNotary");

let accounts;
let owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    const tokenId = 1;
    const instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const starId = 2;
    const starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 3;
    const starPrice = web3.utils.toWei(".01", "ether");
    const balance = web3.utils.toWei(".05", "ether");

    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    const balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.approve(user2, starId, {from: user1, gasPrice: 0});
    await instance.buyStar(starId, {from: user2, value: balance});
    const balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    const value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    const value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 4;
    const starPrice = web3.utils.toWei(".01", "ether");
    const balance = web3.utils.toWei(".05", "ether");

    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    const balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.approve(user2, starId, {from: user1, gasPrice: 0});
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 5;
    const starPrice = web3.utils.toWei(".01", "ether");
    const balance = web3.utils.toWei(".05", "ether");

    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    const balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.approve(user2, starId, {from: user1, gasPrice: 0});
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    const value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});


it('can add the star name and star symbol properly', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const starId = 123;

    await instance.createStar('Test star 1', starId, {from: user1});
    const name = await instance.name();
    const symbol = await instance.symbol();
    assert.equal('StarNotary', name);
    assert.equal('STT', symbol);
});

it('lets 2 users exchange stars', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId1 = 222;
    const starId2 = 333;

    await instance.createStar('User star 1', starId1, { from: user1 });
    await instance.approve(user2, starId1, { from: user1 });

    await instance.createStar('User star 2', starId2, { from: user2 });
    await instance.approve(user1, starId2, { from: user2 });

    await instance.exchangeStars(starId1, starId2, { from: user1 });

    assert.equal(await instance.ownerOf.call(starId1), user2);
    assert.equal(await instance.ownerOf.call(starId2), user1);
});

it('lets a user transfer a star', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 444;

    await instance.createStar('User star 1', starId, { from: user1 });
    await instance.transferStar(user2, starId, { from: user1 });

    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lookUptokenIdToStarInfo test', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const starId = 555;

    await instance.createStar('Cool star name', starId, { from: user1 });

    const starName = await instance.lookUptokenIdToStarInfo(starId);
    assert.equal('Cool star name', starName);
});