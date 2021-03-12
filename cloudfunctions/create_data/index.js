// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})

//获取数据库引用
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  console.log("event ==> ",event)
  let listName = event.listName;
  delete event.listName;
  try{
    return await db.collection(listName).add({
      //添加的数据
      data:event
    })
  }catch(err){
    console.log('err==>',err)
  }
}