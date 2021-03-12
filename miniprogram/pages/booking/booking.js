let tool = require("../../js/tool")

//获取小程序的实例
const app = getApp();

// miniprogram/pages/booking/booking.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //显示骨架屏
    loading:true,
    //收入-支出的下标
    activeIndex: 0,
    //子类型的页面
    page: -1,
    //当前页的下标
    iconIndex:-1,
    //账户类型的激活下标
    activeAccountIndex: -1,
    bookingType: [{
        title: '收入',
        type: 'sr'
      },
      {
        title: '支出',
        type: 'zc'
      }
    ],
    subTypes: [],
    //每一页显示10个子类型
    typeCount: 10,
    accounts: [{
        name: '现金',
        type: 'xj'
      },
      {
        name: '支付宝',
        type: 'zfb'
      },
      {
        name: '微信',
        type: 'wx'
      },
      {
        name: '信用卡',
        type: 'xyk'
      },
      {
        name: '储蓄卡',
        type: 'cxk'
      },
    ],
    //当前日期
    currentDate: '',
    //选择日期
    date: "选择日期",
    //金额
    money: '',
    //备注
    comment: '',
    //用户是否已经授权
    isAuth:false
  },
  onLoad: function (options) {
    this.findBookingSubType();

    //获取当前日期
    let date = new Date();
    this.data.currentDate = tool.formatDate(date, "yyyy-MM-dd");
    this.setData({
      currentDate: this.data.currentDate,
    })

    console.log('app.globalData==>',app.globalData)
  },

  onShow(){
    this.setData({
      isAuth:app.globalData.isAuth
    })
  },

  //切换商品类型(收入-支出),子类型,账户类型
  toggleBookingType(e) {
    //e:事件对象
    //获取下标
    let index = e.currentTarget.dataset.index;
    let key = e.currentTarget.dataset.key

    if (index == this.data[key]) {
      return
    }

    this.data[key] = index

    this.setData({
      [key]: index
    })
  },

  //切换子类型
  toggleSubType(e) {
    //页码
    let page = e.currentTarget.dataset.pages

    //当前页的图标的下标
    let index = e.currentTarget.dataset.index

    //当前页的当前图标
    let currentIcon = this.data.subTypes[page][index]

    console.log(currentIcon)

    if (currentIcon.isActive) {
      return
    }

    let isHas = false;

    //将其他激活状态去除
    for (let i = 0; i < this.data.subTypes.length; i++) {
      let iconData = this.data.subTypes[i];
      for (let j = 0; j < iconData.length; j++) {
        if (iconData[j].isActive) {
          //将其他激活状态去除
          iconData[j].isActive = false;
          isHas = true
          break;
        }
      }
      if (isHas) {
        break;
      }
    }
    //将当前图标状态激活
    currentIcon.isActive = true
    this.setData({
      subTypes: this.data.subTypes,
      page,
      iconIndex:index
    })
  },

  //查询记账子类型
  findBookingSubType() {
    console.log('调用find_data')

    wx.showLoading({
      title: '加载中',
      mask:true,
      duration:2000
    })

    wx.cloud.callFunction({
      name: 'find_data',
      data: {
        listName: 'booking_item'
      }
    }).then(res => {
      console.log('res==>', res)
      res.result.data.forEach(v => {
        v.isActive = false
      })
      let typeData = []
      for (let i = 0; i < res.result.data.length; i += this.data.typeCount) {
        let types = res.result.data.slice(i, i + this.data.typeCount)
        typeData.push(types)
      }
      this.setData({
        subTypes: typeData,
        loading:false
      })
    }).catch(err => {
      // wx.hideloading()
      console.log('err==>', err)
    })
  },

  //设置输入框的值
  setValue(e) {
    let key = e.currentTarget.dataset.key
    // console.log('key==>',key)

    let value = e.detail.value
    if (key == 'comment' && /[<>]/.test(value)) {
      wx.showToast({
        title: '备注不能包含<>符号',
        icon: "none",
        duration: 2000
      })
      this.setData({
        [key]: ""
      })
      return
    }

    this.setData({
      [key]: e.detail.value
    })
    // console.log('this.data[key]==>',this.data[key])
  },

  createBooking(data){
    wx.cloud.callFunction({
      name:"create_data",
      data
    }).then(res=>{
      console.log('res==>',res)

      this.data.subTypes[this.data.page][this.data.iconIndex].isActive = false

      this.setData({
        //子类型的页面
        page: -1,
        //当前页的下标
        iconIndex:-1,
        //账户类型的激活下标
        activeAccountIndex: -1,
        //选择日期
        date: "选择日期",
        //金额
        money: '',
        //备注
        comment: '',
        subTypes:this.data.subTypes
      })

      wx.showToast({
        title: '保存成功',
        icon: 'none',
        duration: 2000
      })
    }).catch(err=>{
      console.log('err==>',err)
    })
  },

  //保存记账数据
  save() {
    //判断是否选择子类型
    if (this.data.page == -1 && this.data.iconIndex == -1) {
      return wx.showToast({
        title: '请选择记账类型(餐饮,购物等)',
        icon: "none",
        duration: 2000
      })
    }

    //判断是否选择账户类型
    if (this.data.activeAccountIndex == -1) {
      return wx.showToast({
        title: '请选择账户类型',
        icon: "none",
        duration: 2000
      })
    }

    //判断是否选择日期
    if (this.data.date == "选择日期") {
      return wx.showToast({
        title: '请选择日期',
        icon: "none",
        duration: 2000
      })
    }

    //判断是否填写金额
    if (!this.data.money) {
      return wx.showToast({
        title: '请填写金额',
        icon: "none",
        duration: 2000
      })
    }


    console.log("输入信息正确")

    let data = {
      date:this.data.date,
      money:this.data.money,
      comment:this.data.comment,
      listName:'booking'
    }
    //获取收入和支出类型
    data.mainType = this.data.bookingType[this.data.activeIndex];
    //获取子类型
    data.subType = this.data.subTypes[this.data.page][this.data.iconIndex]
    console.log(data.subType)
    //获取账户类型
    data.account = this.data.accounts[this.data.activeAccountIndex]

    this.createBooking(data)
  },

  //获取用户授权信息
  getuserAuthInfo(res){
    console.log('res==>',res);
    if(res.detail.userInfo){
      app.globalData.isAuth = true
      this.setData({
        isAuth:true
      })
    }
  }

})