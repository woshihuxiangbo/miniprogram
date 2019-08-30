// Component/addressTable/addressTable.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tableHidden: {
      type: Boolean,
      value: true
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
        tableHidden: true
      })
      let myEventDetail = {};    // detail对象，提供给事件监听函数
      let myEventOption = {};    // 触发事件的选项
      this.triggerEvent('cancel', myEventDetail, myEventOption);
    },
    confirmTap(e) {
      this.setData({
        tableHidden: true
      })
      let myEventDetail = {};    // detail对象，提供给事件监听函数
      let myEventOption = {};    // 触发事件的选项
      this.triggerEvent('confirm', myEventDetail, myEventOption);
    }
  }
})