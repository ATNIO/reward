const fs = require('fs-extra')
var xlsx = require('node-xlsx').default;
const obj = xlsx.parse(`${__dirname}/1-14 深圳活动奖励.xlsx`);
var excelObj=obj[0].data;

let todos = new Map();
let count = 0;
excelObj.forEach((o, index) => {
  if(index == 0) {
    return;
  }
  if( o[3] == '未领取' || !o[3] ) {
    return;
  }
  if(todos.has(o[3].toLowerCase())){
    let oldV = todos.get(o[3].toLowerCase());
    let newV = oldV + o[4];
    todos.set(o[3].toLowerCase(), newV);
  }else{
    todos.set(o[3].toLowerCase(),o[4]);
  }
});

todos.forEach((v ,k ,m) => {
  count += +v;
})

console.log(count);

fs.outputJsonSync('./todo.json', strMapToObj(todos));


function strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k, v] of strMap) {
    obj[k] = v;
  }
  return obj;
}