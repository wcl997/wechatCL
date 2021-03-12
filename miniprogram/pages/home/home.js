// miniprogram/pages/home/home.js
let tool = require('../../js/tool')
Page({

  data: {
    loading:false,
    currentDate:'',
    currentDateBooking:[],
    //显示x月x日
    date:'',
    //当天收入和支出的总额
    currentDateMoney:{
      sr:0,
      zc:0,
      count:0
    },
    //选择日期
    pickerDate:{
      //当月01号
      start:'',
      //当月当日
      end:''
    },

    //本月总额(收入-支出-结余)
    currentMonthBooking:{
      sr:0,
      srDecimal:'',
      zc:0,
      zcDecimal:'',
      jy:0,
      jyDecimal:'',
    }
  },

  onLoad: function (options) {
    let currentDate = tool.formatDate(new Date(),'yyyy-MM-dd')
    let d= currentDate.split('-')
    this.data.pickerDate.start = d[0] +'-'+ d[1] + '-01'
    this.data.pickerDate.end = currentDate
    // console.log(this.data.pickerDate)
    this.setData({
      currentDate
    })
  },
  onShow:function(){
    this.getBookingDataByDate();
    this.findBookingByMonth();
  },

  getBookingDataByDate(){
    // console.log(this.data.currentDate)
    wx.showLoading({
      title: '加载中...',
      mask:true,
      duration:2000
    })

    wx.cloud.callFunction({
      name:'find_data',
      data:{
        date:this.data.currentDate,
        listName:'booking'
      }
    }).then(res=>{
      wx.hideLoading()
      // console.log('res ==>',res)
      this.setData({
        currentDateMoney:{
          sr:0,
          zc:0,
          count:0
        }
      })
      let date = this.data.currentDate.split('-');
      date = date[1]+'月' + date[2] + '日'

      //计算当天的收入和支出总额
      res.result.data.forEach(v=>{
        this.data.currentDateMoney[v.mainType.type] += Number(v.money)
        v.money = Number(v.money).toFixed(2);
      })
      
      for(let key in this.data.currentDateMoney){
        if(key == 'count'){
          continue
        }
        this.data.currentDateMoney[key] = this.data.currentDateMoney[key].toFixed(2);
      }

      this.setData({
        currentDateBooking: res.result.data,
        date,
        currentDateMoney:this.data.currentDateMoney
      })
      // console.log(this.data.currentDateBooking)
    }).catch(err=>{
      wx.hideLoading()
      console.log('err ==> ',err)
    })
  },
  //切换日期
  toggleCurrentDate(e){
    if(e.detail.value == this.data.currentDate){
      return
    }

    this.setData({
      currentDate:e.detail.value
    })

    this.getBookingDataByDate()
  },

  //获取当年当月的记账数据
  //2021-03-01 - 2021-03-05
  findBookingByMonth(){

    this.setData({
      currentMonthBooking:{
        sr:0,
        srDecimal:'',
        zc:0,
        zcDecimal:'',
        jy:0,
        jyDecimal:'',
      }
    })

    wx.showLoading({
      title: '加载中...',
      mask:true,
    })

    wx.cloud.callFunction({
      name:'find_booking_by_month',
      data:{
        start:this.data.pickerDate.start,
        end:this.data.pickerDate.end
      }
    }).then(res=>{
      wx.hideLoading()
      // console.log('res ==>',res)
      res.result.data.forEach(v=>{
        this.data.currentMonthBooking[v.mainType.type] += Number(v.money)
      })
      this.data.currentMonthBooking.jy = this.data.currentMonthBooking.sr - this.data.currentMonthBooking.zc;

      let keys = ['sr','zc','jy']
      keys.forEach(v=>{
        let data = this.data.currentMonthBooking[v].toFixed(2).split('.');
        this.data.currentMonthBooking[v] = data[0];
        this.data.currentMonthBooking[v + 'Decimal'] = data[1]
      })
      this.setData({
        currentMonthBooking:this.data.currentMonthBooking
      })
    }).catch(err=>{
      wx.hideLoading()
      console.log('err ==> ',err)
    })
  }
})