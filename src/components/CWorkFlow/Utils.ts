export function deepCloneJSON(json) {
  return JSON.parse(JSON.stringify(json));
}



//生成指定长度的唯一ID
export function uuid(randomLength = 8) {
  return Number(
    Math.random().toString().substr(3, randomLength) + Date.now()
  ).toString(36);
}




export function loopTree(tree,cb,{children}){



}
