// Component/my-video/my-video.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    id: {
      type: String,
      value: 'v1'
    },
    poster: {
      type: String,
      value: ''
    },
    src: {
      type: String,
      value: ''
    },
    startIcon: {
      type: Object,
      value: {
        src: 'http://img.chuangxiaozhu.com/wxapp/icons/startVideo_1.png',
        w: 100,
        h: 100
      }
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
    startTap() {
      this.setData({
        posterHidden: true
      }, () => {
        this.video = wx.createVideoContext(this.data.id, this)
        this.video.play();
        let myEventDetail = {}; // detail对象，提供给事件监听函数
        let myEventOption = {}; // 触发事件的选项
        this.triggerEvent('start', myEventDetail, myEventOption);
      })
    },
    endFn() {
      this.setData({
        posterHidden: false
      })
      let myEventDetail = {}; // detail对象，提供给事件监听函数
      let myEventOption = {}; // 触发事件的选项
      this.triggerEvent('end', myEventDetail, myEventOption);
    }
  }
})