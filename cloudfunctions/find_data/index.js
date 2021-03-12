// 云函数入口文件
const cloud = require('wx-server-sdk')

//初始化云能力
cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})

//获取数据库引用
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  
  console.log("event==>",event)

  let userInfo = event.userInfo;
  let listName = event.listName;
  delete event.userInfo;
  delete event.listName;

  try{
    if(Object.keys(event).length ==0){
      return await db.collection(listName).get();
    }else{
      return await db.collection(listName).where({...event,userInfo}).get();
    }
  }catch(err){
    console.log("err ==> ",err)
  }
}