import CommonService from '../../utils/common.js';
Component({
  properties: {
    footShare: { //控制置顶是否显示
      type: Boolean,
      value: false
    },
    isShare: { //是否点击直接分享 
      type: Boolean,
      value: true
    },
    right: {
      type: Number || String,
      value: 30
    },
    bottom: {
      type: Number || String,
      value: 30
    }
  },
  methods: {
    goTop: function() {
      if (wx.pageScrollTo) {
        wx.pageScrollTo({
          scrollTop: 0
        })
      }
    },
    tap(e) {
      if (e.detail.errMsg == 'getUserInfo:ok') {
        /**为了优化面板弹出时间，事件直接提了出来 */
        let myEventDetail = {}; // detail对象，提供给事件监听函数
        let myEventOption = {}; // 触发事件的选项
        this.triggerEvent('share', myEventDetail, myEventOption);
      }
      CommonService.getUserInfo(e.detail, res => {});
    }
  }

})