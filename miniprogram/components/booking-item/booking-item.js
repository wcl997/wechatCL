// components/booking-item/booking-item.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isDelete:{
      type:Boolean,
      value:false
    },
    bookingData:{
      type:Object,
      value:{}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //删除当前的记账数据
    removeCurrentBooking(e){
      let _id = e.currentTarget.dataset._id
       console.log(_id)
      this.triggerEvent('remove',{_id})
    }
  }
})
