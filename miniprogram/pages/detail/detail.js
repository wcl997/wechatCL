// miniprogram/pages/detail/detail.js
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
    //截取参数
    console.log('options ==>',options)

    let _ids = options._ids.split('-');
    this.getBookingDateById(_ids)
  },

  //根据记账的_id查询数据
  getBookingDateById(_ids){
    //_ids:记账的id集合,Array
    wx.cloud.callFunction({
      name:'find_booking_by_id',
      data:{
        _ids
      }
    }).then(res=>{
      wx.hideLoading();
      console.log('根据记账的_id查询数据res ==>',res)
      let data = res.result.data[0]
      wx.setNavigationBarTitle({
        title: `${data.mainType.title}-${data.subType.name}记账详情`,
      })
      this.setData({
        bookingData:res.result.data,
        loading:false
      })
    }).catch(err=>{
      wx.hideLoading();
      console.log('err ==>',err)
    })
  }
})