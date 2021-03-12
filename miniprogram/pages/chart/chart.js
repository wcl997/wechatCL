import * as echarts from '../../components/ec-canvas/echarts';

let tool = require('../../js/tool');
//保存绘制canvas图形对象
let chartCanvas = null;

Page({
  data: {
    loading: false,
    ec: {
      onInit: null
    },
    //选择日期
    date: '选择日期',

    copyDate: '',
    //结束日期
    end: '',
    //日期状态,0年1月2日
    dateStatus: 0,
    //默认激活下标
    activeIndex:0,
    //收入-支出
    subType: [
      {
        title: '收入',
        type:'sr',
        money:0
      },
      {
        title: '支出',
        type:'zc',
        money:0
      }
    ],
    //大月(31号月份)
    largeMonth:['01','03','05','07','08','10','12'],

    //记账数据
    bookingData:{}

  },
  onLoad() {
    let currentDate = tool.formatDate(new Date(), 'yyyy-MM-dd')
    this.setData({
      end: currentDate,
      copyDate: currentDate.split('-'),
      ec:{
        onInit:this.initChart
      }
    })

    this.initDate();

    this.findBookingDataByDate();
  },

  //初始化canvas,饼图
  initChart(canvas, width, height, dpr){
    let chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr // new
    });
    canvas.setChart(chart);
  
    //绘制canvas
    chart.setOption({});

    chartCanvas = chart;

    return chart;
  },
  //选择日期
  selectDate(e) {
    // console.log('e==>', e)
    let date = e.detail.value.split('-')
    this.setData({
      copyDate: date
    })
    this.initDate();
    this.findBookingDataByDate()
  },

  //初始化查询方式选择的日期
  initDate() {
    let dateStatus = this.data.dateStatus;

    let date = this.data.copyDate;

    if (dateStatus == 0) {
      this.data.date = `${date[0]}年`
    } else if (dateStatus == 1) {
      this.data.date = `${date[0]}年${date[1]}月`
    } else {
      this.data.date = `${date[0]}年${date[1]}月${date[2]}日`
    }

    this.setData({
      date: this.data.date
    })
  },

  //切换日期查询方式
  toggleDateType() {
    let dateStatus = this.data.dateStatus;

    if (dateStatus == 2) {
      dateStatus = 0;
    } else {
      dateStatus++
    }

    this.setData({
      dateStatus,
    })

    this.initDate();
    this.findBookingDataByDate();
  },

  //切换收入-支出
  toggleSubType(e){
    let index = e.currentTarget.dataset.index;
    if(index == this.data.activeIndex){
      return;
    }
    this.setData({
      activeIndex:index
    })
    this.getColorsByType()
  },
  //获取不同类型的颜色
  getColorsByType(){
    //颜色
    let colors = []
    //获取指定类型的颜色(收入或者支出)
    let type = this.data.bookingData[this.data.subType[this.data.activeIndex].type]
    let tyData = type? type.subType : [];
    console.log('tyData ==>',tyData);
    console.log('type ==>',type);

    tyData.forEach(v=>{
      colors.push(v.color);
    })

    this.drawPie(colors,tyData)
    
  },

  //重绘饼图
  drawPie(colors,tyData){
    let option = {
      backgroundColor: "#ffffff",
      legend: {
        top: "bottom",
        left: 'center'
      },
      series: [{
        label: {
          normal: {
            fontSize: 14
          }
        },
        type: 'pie',
        center: ['50%', '50%'],
        radius: ['0%', '60%'],
        // roseType: 'area',
        //颜色需要动态设置
        color: colors,
        //饼状图数据需要动态设置
        data: tyData
      }]
    };

    chartCanvas.setOption(option)
  },
  //查询记账数据
  findBookingData(name,data){
    wx.showLoading({
      title: '加载中...',
      mask:true
    })
    wx.cloud.callFunction({
      name,
      data
    }).then(result =>{
      wx.hideLoading();
      console.log('[查询记账数据] result ==>',result)

      //按收入和支出分类
      let typeData = {}
      //遍历result.result.data
      result.result.data.forEach(v=>{
        
        if(!typeData[v.mainType.type]){
          typeData[v.mainType.type] = [v]
        }else{
          typeData[v.mainType.type].push(v)
        }

      })
      // console.log('typeData==>',typeData)

      //在收入和支出筛选子类型(学习,健康,...)
      let bookingData = {};
      for(let key in typeData){
        let ty = {
          total:0,
          subType:{}
        };
        typeData[key].forEach(v =>{
          ty.total += Number(v.money)
          //寻找subType是否含有学习,健康等类型
          let keys = Object.keys(ty.subType);
          if(keys.indexOf(v.subType.type) === -1){
            //如果找不到,初始化

            //随机生成一个颜色
            let color = tool.createRandomColor();

            //ty.subType.sr或者ty.subType.zc
            ty.subType[v.subType.type] = {
              name:v.subType.name,
              title:v.subType.name,
              value:Number(v.money),
              count:1,
              type:[v],
              icon:v.subType.icon,
              color,
              cty:v.mainType.type,
              _ids:[v._id]
            }

          }else{
            ty.subType[v.subType.type].value += Number(v.money)
            ty.subType[v.subType.type].count++;
            ty.subType[v.subType.type].type.push(v)
            ty.subType[v.subType.type]._ids.push(v._id)
          }
        })
        bookingData[key] = ty
      }
      // console.log('bookingData==>',bookingData)
      this.data.subType.forEach(v=>{
        v.money = 0
        if(bookingData[v.type]){
          v.money = bookingData[v.type].total
        }
      })

      for(let k in bookingData){
        let bd = bookingData[k].subType
        let tyDataArray = []
        for(let key in bd){
          bd[key].ty = key;
          bd[key].name = bd[key].name + " " +Math.round(bd[key].value / bookingData[k].total *100) +'%';
          tyDataArray.push(bd[key])
        }
        bookingData[k].subType = tyDataArray
      }

      this.setData({
        bookingData,
        subType:this.data.subType,
      })
      
      console.log('this.data.bookingData ==>',this.data.bookingData)

      this.getColorsByType();
    }).catch(err =>{
      wx.hideLoading();
      console.log('err ==>',err)
    })
  },

  //根据日期查询记账数据
  findBookingDataByDate(){
    //获取查询日期条件
    let start = ''
    let end = ''

    //获取当前日期
    let current =tool.formatDate(new Date(),'yyyy-MM-dd').split('-');
    // console.log('current ==>', current)

    //获取用户查询的日期
    let copyDate = this.data.copyDate
    // console.log(copyDate)

    //如果同年
    if(current[0] == copyDate[0]){
      console.log('同年');
      if(this.data.dateStatus == 0){
        /*
          按年查询
          date的查询条件范围:当年-01-01 至 当年-当月-当日
        */
       start = `${copyDate[0]}-01-01`;
       end = current.join('-')
      }else if(this.data.dateStatus == 1){
        /*
          按月查询
        */

        start = `${copyDate[0]}-${copyDate[1]}-01`;

        console.log('按月查询')
        if(current[1] == copyDate[1]){
          /*
            如果同月
            date的查询条件范围:当年当月-01 至 当年-当月-当日
          */
          // start = `${current[0]}-${current[1]}-01`
          end = current.join('-')
        }else{
          //如果不同月
          

          if(copyDate[1] == 2){
            //如果二月份
            //判断年份是否为闰年
            if(copyDate[0] % 400 == 0 || copyDate[0] % 4 == 0 && copyDate[0] % 100 !=0){
              //date的查询条件范围 当年-02-01 至 当年-02-29
              end = `${copyDate[0]}-${copyDate[1]}-29`
            }else{
              end = `${copyDate[0]}-${copyDate[1]}-28`
            }
          }else{
            //如果不是2月份
            //判断月份是否大月(1,3,5,7,8,10,12)
            if(this.data.largeMonth.indexOf(copyDate[1]) > -1){
              end = `${copyDate[0]}-${copyDate[1]}-31`
            }else{
              end = `${copyDate[0]}-${copyDate[1]}-30`
            }
          }
        }
        
      }else{
        console.log('按日查询')
        /*
          按日查询
        */
       start = copyDate.join('-');
      }
      

    }else{
      console.log('不同年');
      if(this.data.dateStatus == 0){
        //按年查询
        start = `${copyDate[0]}-01-01`;
        end = `${copyDate[0]}-12-31`
      }else if(this.data.dateStatus == 1){
        //按月查询
        start = `${copyDate[0]}-${copyDate[1]}-01`;

        //如果不同月
        if(copyDate[1] == 2){
          //如果二月份
          //判断年份是否为闰年
          if(copyDate[0] % 400 == 0 || copyDate[0] % 4 == 0 && copyDate[0] % 100 !=0){
            //date的查询条件范围 当年-02-01 至 当年-02-29
            end = `${copyDate[0]}-${copyDate[1]}-29`
          }else{
            end = `${copyDate[0]}-${copyDate[1]}-28`
          }
        }else{
          //如果不是2月份
          //判断月份是否大月(1,3,5,7,8,10,12)
          if(this.data.largeMonth.indexOf(copyDate[1]) > -1){
            end = `${copyDate[0]}-${copyDate[1]}-31`
          }else{
            end = `${copyDate[0]}-${copyDate[1]}-30`
          }
        }
        
      }else{
        //按日查询
        start = copyDate.join('-')
      }
    }

    // console.log('start ==>',start)
    // console.log('end ==>',end)
    
    //如果存在end
    if(end){
      //根据start和end查询记账数据
      //调用云函数[find_booking_by_month]

      this.findBookingData('find_booking_by_month',{start,end})

    }else{
      //根据start查询记账数据
      //调用云函数[find_data]
      this.findBookingData('find_data',{date:start,listName:'booking'})
    }
  },
  //查看记账详情
  goDetail(e){
    wx.navigateTo({
      url: `../detail/detail?_ids=${e.detail._ids.join('-')}`,
    })
  }
});