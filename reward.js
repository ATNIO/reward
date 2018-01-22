const BN = require('bignumber.js')
const Web3 = require("web3")
const config = require('./config.json');
const atnAbi = require('./ATN.json')
const fs = require('fs-extra')

async function run() {

  let todofile = `./todo.json`
  let donefile = `./done.json`
  let dones = objToStrMap(fs.readJsonSync(donefile)); 
  let todos = objToStrMap(fs.readJsonSync(todofile));

  var web3 = new Web3(config.endpoint);
  var privateKeyString = config.private_key;
  var myAccount = web3.eth.accounts.privateKeyToAccount("0x" + privateKeyString);
  var owner = myAccount.address;
  console.log(myAccount);
  web3.eth.accounts.wallet.add(myAccount);
  let balance = await web3.eth.getBalance(owner)
  console.log(`Address ${owner} balance is  ${balance}`);
  if (balance <= 0) return;

  const atn = new web3.eth.Contract(atnAbi, config.atn);
  const tokenBalance = await atn.methods.balanceOf(owner).call();
  console.log(`Address ${owner} tokenBalance is ${tokenBalance}`);
  if (tokenBalance == 0) return;

  // let i = 0;
  for (let [key, value] of todos) {
    // if(i >= 1) break;
    console.log(key)
    console.log(value)
    value = new BN(value);
    value = value.mul(1e+18);
    console.log('value',value.toNumber());    
    let tx = {};
    tx.address = key;
    const todoBalance = await atn.methods.balanceOf(key).call();
    console.log(`Address ${key} tokenBalance is ${todoBalance}`);
    tx.balance = todoBalance;
    
    let receipt = await atn.methods['transfer(address,uint256)'](key, value)
      .send({
        from: owner,
        gasPrice: 22000100000,
        gas: 90000
      }, (err, hash) => {
        if (err) console.error(err);
        console.log(`hash: ${hash}`)
        tx.hash = hash;
      })
    console.log(`${key} receipt : ${receipt}`);
    tx.receipt = receipt;
    const doneBalance = await atn.methods.balanceOf(key).call();
    console.log(`Address ${key} tokenBalance is ${doneBalance}`);    
    tx.balance = doneBalance;
    todos.delete(key);
    dones.set(key, tx);
    // i++;
  }

  fs.outputJsonSync(donefile, strMapToObj(dones));
  fs.outputJsonSync(todofile, strMapToObj(todos));

}

run()

function objToStrMap(obj) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
  }
  return strMap;
}

function strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k, v] of strMap) {
    obj[k] = v;
  }
  return obj;
}