// component/shareBar/shareBar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tableShow: {   //0 默认  1显示 -1回去
      type: Number,
      value: 0
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
    cancelTap(e) {
      this.setData({
        tableShow: -1
      })
      let myEventDetail = {}; // detail对象，提供给事件监听函数
      let myEventOption = {}; // 触发事件的选项
      this.triggerEvent('cancel', myEventDetail, myEventOption);
    },
    saveTap(e) {
      let myEventDetail = {}; // detail对象，提供给事件监听函数
      let myEventOption = {}; // 触发事件的选项
      this.triggerEvent('save', myEventDetail, myEventOption);
    }
  }
})