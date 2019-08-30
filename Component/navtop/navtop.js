// Component/navtop/navtop.js
let app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    navTitle: {
      type: String,
      value: '团购小店'
    },
    backUrl: {
      type: String,
      value: '/pages/index/index'
    }
  },
  /**
   * 生命周期
   */
  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
      let obj = wx.getMenuButtonBoundingClientRect();
      this.setData({
        navH: obj.height + obj.top,
        statusH: app.globalData.phoneInfo.statusBarHeight
      })
    },
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
    goback(e) {
      let len = getCurrentPages().length;
      if (len > 1) {
        wx.navigateBack({})
      } else {
        wx.reLaunch({
          url: this.data.backUrl,
        })
      }
    }
  }
})