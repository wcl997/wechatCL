//获取小程序实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfoData:{},
    isAuth:false
  },
  onLoad(){
    this.getUserInfo()
  },
  onShow(){
    this.setData({
      isAuth:app.globalData.isAuth
    })

  },

  //查看我的记账
  viewMyBooking(){
    wx.navigateTo({
      url: '../myBooking/myBooking',
    })
  },

  //获取用户信息
  getUserInfo(){
    if(app.globalData.isAuth){
      //必须授权后才可以执行
      wx.getUserInfo({
        success:res=> {
          this.setData({
            userInfoData:res.userInfo
          })
          console.log('userInfo==>',this.data.userInfoData)
        }
      })
    }
  },

  //获取用户授权信息
  getuserAuthInfo(res){
    console.log('res==>',res)
    if(res.detail.userInfo){
      app.globalData.isAuth = true
      this.setData({
        isAuth:true,
        userInfoData:res.detail.userInfo
      })
    }
  }
})