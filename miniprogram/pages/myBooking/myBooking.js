// miniprogram/pages/myBooking/myBooking.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading:true,
    bookingData:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.findMyAllBookingData()
  },

  //获取我的所有记账数据
  findMyAllBookingData(){
    wx.showLoading({
      title: '加载中...',
      mask:true,
    })

    wx.cloud.callFunction({
      name:'find_user_all_data',
      data:{
        listName:'booking'
      }
    }).then(res=>{
      wx.hideLoading();
      console.log('res ==>',res)
      this.setData({
        bookingData:res.result.data,
        loading:false
      })
    }).catch(err=>{
      wx.hideLoading();
      console.log('err ==>',err)
    })
  },

  //删除记账
  removeBooking(e){
    console.log("e ==>",e)
    // console.log('删除记账')

    wx.showModal({
      title: '提示',
      content: '该操作将永久删除数据,是否继续?',
      success: res=> {
        if (res.confirm) {
          wx.showLoading({
            title: '加载中...',
            mask:true,
          })
      
          wx.cloud.callFunction({
            name:'remove_user_data',
            data:{
              listName:'booking',
              _id:e.detail._id
            }
          }).then(data=>{
            wx.hideLoading();
            console.log("删除记账数据data==>",data)

            if(data.result.stats.removed == 1){
              console.log('e.currentTarget.dataset.index==>',e.currentTarget.dataset.index)
              this.data.bookingData.splice(e.currentTarget.dataset.index,1)

              this.setData({
                bookingData:this.data.bookingData
              })
              wx.showToast({
                title: '删除成功',
                icon: 'none',
                duration: 2000
              })
            }else{
              wx.showToast({
                title: '删除失败',
                icon: 'none',
                duration: 2000
              })
            }
          }).catch(err=>{
            wx.hideLoading();
            wx.showToast({
              title: '删除失败',
              icon: 'none',
              duration: 2000
            })
            console.log('err==>',err)
          })
        }
      }
    })

    
  }
})