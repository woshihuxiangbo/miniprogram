// component/repay/repay.js
//退款原因组件
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    items: {
      type: Array,
      value: ['协商退款', '缺货', '未按约定时间发货', '其他']
    },
    title: {
      type: String,
      value: '退款原因'
    },
    tableShow: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currnetItem: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    swichItem(e) {
      let idx = e.currentTarget.dataset.idx;
      this.setData({
        currnetItem: idx
      })
    },
    submit(e) {
      this.setData({
        tableShow: false
      })
      let myEventDetail = { // detail对象，提供给事件监听函数
        value: this.data.items[this.data.currnetItem]
      }
      let myEventOption = {} // 触发事件的选项
      this.triggerEvent('submitValue', myEventDetail, myEventOption);
    }
  }
})