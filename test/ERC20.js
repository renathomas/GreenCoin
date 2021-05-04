const ERC20 = artifacts.require('../contracts/token/GreenCoin.sol');
const {assertRevert, ensureException} = require('./helpers/utils');

contract('ERC20', (accounts) => {
  
  let token;
  const owner = accounts[0];
  const to = accounts[1];
    
  
  beforeEach(async () => {
    token = await ERC20.new();
  });

  
  describe('Total supply should be 0 at start, before minting', function () {
    it('should give the total supply', async function () {
    	const ts = await token.totalSupply();
    	total_sup = ts.toNumber();
      assert.equal(0, total_sup);
    });
  });

  
  describe('mint some tokens and then check that total supply is not 0', function () {
  	it('mints the requested amount', async function () {
  		const amount = 150
  		const from = owner;
			const { logs } = await token.mint(owner, amount, { from });
			const balance = await token.balanceOf(owner);
			assert(balance.eq(amount));

			const totalSupply = await token.totalSupply();
			assert(totalSupply.eq(amount));
	  });
  });

	
  describe('Check balanceOf before and after minting', function () {
    it('mints the requested amount', async function () {
  		let balance = await token.balanceOf(owner);
  		assert(balance.eq(0));

			const { logs } = await token.mint(owner, 5, { owner });
			balance = await token.balanceOf(owner);
			assert(balance.eq(5));
  		});
	});


  describe('Check balanceOf before and after transfering funds', function () {
    it('mints the requested amount', async function () {
      let balance = await token.balanceOf(owner);
      assert(balance.eq(0));
      
      await token.mint(owner, 500, { from: owner });
      await token.enableTransfers({ owner });
      
      balance = await token.balanceOf(owner);
      assert(balance.eq(500));

      await token.transfer(to, 100, { from: owner });
      
      balance = await token.balanceOf(owner);
      assert.equal(400, balance.toNumber());

      balance = await token.balanceOf(to);
      assert.equal(100, balance.toNumber());
    });
  });

	
  describe('Check allowances before and after "Approve" action', function () {
    const amount = 200;

    it('mints the requested amount, enables transfers, transfers money and then approves', async function () {
      const { mint_logs } = await token.mint(owner, amount, { from: owner });
			balance = await token.balanceOf(owner);
			assert(balance.eq(amount));
			
			const { enable_logs } = await token.enableTransfers({ owner });
      const allowTransfers = await token.allowTransfers();
      assert.equal(allowTransfers, true);
      
      balance = await token.balanceOf(owner);
			const { transfer_logs } = await token.transfer(to, 100, { from: owner });
			balance = await token.balanceOf(to);
			assert.equal(100, balance.toNumber());

			//Now we can approve funds from spender account:
			let allowance = await token.allowance(to, owner);
			assert.equal(0, allowance);

			const { approve_log } = await token.approve(owner, 50, {from: to});
			allowance = await token.allowance(to, owner);
			assert.equal(50, allowance);
		});
	});


  describe('Check transferFrom works with spender and transfers between independent accounts', function () {
    it('Mint, transfer, approve and then test transferFrom', async function() {
      await token.mint(owner, 200, { from: owner });
      await token.enableTransfers({ from: owner });

      let balance = await token.balanceOf(owner);
      assert.equal(200, balance.toNumber());
      
      await token.approve(accounts[2], 50, {from: owner});
      await token.transferFrom(owner, accounts[1], 25, {from: accounts[2]});

      balance = await token.balanceOf(owner);
      assert.equal(175, balance.toNumber());

      balance = await token.balanceOf(accounts[1]);
      assert.equal(25, balance.toNumber());

      let allowance = await token.allowance(owner, accounts[2]);
      assert.equal(25, allowance);
    });
  });

	
  describe('Check transferFrom works only after approval', function () {
		it('Mint, transfer, approve and then test transferFrom', async function() {
			await token.mint(owner, 200, { owner });
			await token.enableTransfers({ owner });
			await token.transfer(to, 100, { from: owner });
			balance = await token.balanceOf(to);
			assert.equal(100, balance.toNumber());
			
			//should fail because we didnt approve an allowance
        await assertRevert(token.transferFrom(to, owner, 25));
			
			//approve owner to withdraw 50 units from account "to"
			await token.approve(owner, 50, {from: to});
			await token.transferFrom(to, owner, 25);

			//check that allowance decreased by 25 units
			let allowance = await token.allowance(to, owner);
			assert.equal(25, allowance);
			
			//check that balance decreased from 100 to 75 
			balance = await token.balanceOf(to);
			assert.equal(75, balance.toNumber());
		});
	});

	
  describe('Check that approve() only works when allowance==0 ', function () {
		it('Mint, transfer, and approve twice', async function() {
			await token.mint(owner, 200, { owner });
			await token.enableTransfers({ owner });
			
			await token.approve(to, 50, {from: owner});
			let allowance = await token.allowance(owner, to);
			assert.equal(50, allowance.toNumber());

			await assertRevert(token.approve(to, 50, {from: owner}));   	
		});
	});

	
  describe('Check that increase/decrease allowance works properly ', function () {
		it('Mint, transfer, approve and increase/decrease amount', async function() {
			await token.mint(owner, 200, { owner });
			await token.enableTransfers({ owner });
			await token.approve(to, 50, {from: owner});
			
			let allowance = await token.allowance(owner, to);
			assert.equal(50, allowance.toNumber());

			await token.decreaseAllowance(to, 50, { from: owner });
			allowance = await token.allowance(owner, to);
			assert.equal(0, allowance.toNumber());
			
			//approve should work now because allowance is 0:
			token.approve(to, 10, {from: owner});

			await token.increaseAllowance(to, 30, { from: owner });
			allowance = await token.allowance(owner, to);
			assert.equal(40, allowance.toNumber());
		});
	});

	
  describe('when the spender does not have enough approved balance', function () {
		it('Mint, transfer, approve - transferFrom should fail', async function() {
			await token.mint(owner, 200, { owner });
			await token.enableTransfers({ owner });
			await token.approve(to, 10, {from: owner});
			
			let allowance = await token.allowance(owner, to);
			assert.equal(10, allowance.toNumber());

			await assertRevert(token.transferFrom(owner, to, 15));
		});
  });

	
  describe('when the transfer recipient is has zero address', function () {
		const to = '0x0000000000000000000000000000000000000000';
		
		it('Reverts transaction due to invalid recipient', async function () {
			await token.mint(owner, 200, { owner });
  		await token.enableTransfers({ owner });

  		//check that it won't send to a zero address 
			await assertRevert(token.transfer(to, 100, { from: owner }));
		});
	});

	
  describe('when the approved spender has zero address', function () {
		const to = '0x0000000000000000000000000000000000000000';	
		
    it('reverts due to spender having a zero address', async function () {
			await token.mint(owner, 200, { owner });
  		await token.enableTransfers({ owner });
  		
      //check that it won't send to a zero address 
			await assertRevert(token.approve(to, 10, { from: owner }));
		});
	});

  describe('verifies a transferFrom() fails to/from zero address', function() {
    const to = '0x0000000000000000000000000000000000000000';  

    it('mints, approve, transferFrom --> reverts', async () => {
      await token.mint(owner, 200, { from: owner });
      await token.enableTransfers({ from: owner });
      await token.approve(accounts[3], 100, {from: owner});
      
      await assertRevert(token.transferFrom(owner, to, 50, { from: accounts[3] }));
    });
  });
  

  describe('verifies a transfer fires the Transfer() event log', function() {
    it('mints, enables transafers, transfers --> event firing', async () => {
      await token.mint(owner, 200, { owner });
      await token.enableTransfers({ owner });
      let res = await token.transfer(accounts[1], 50);
      assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
    });
  });


  describe('verifies a transferFrom() fires the Transfer() event log', function() {
    it('mints, enables transafers, approve, transferFrom --> event firing', async () => {
      await token.mint(owner, 200, { owner });
      await token.enableTransfers({ owner });
      await token.approve(accounts[1], 500);
      
      let res = await token.transferFrom(accounts[0], accounts[2], 50, {
          from: accounts[1]
      });

      assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
    });
  });
  
  describe('verifies that approve() fires the Approve() event log', function() {
    it('mints, enables transafers, transfers and checks for event firing', async () => {
      await token.mint(owner, 200, { owner });
      await token.enableTransfers({ owner });
      let res = await token.approve(to, 50, {from: owner});
      assert(res.logs.length > 0 && res.logs[0].event == 'Approval');
    });
  });
  

});
