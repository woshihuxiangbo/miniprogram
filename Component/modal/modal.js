// Component/modal/modal.js
import CommonService from '../../utils/common.js';
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: '获取您的头像、昵称'
    },
    content: {
      type: String,
      value: '当前尚未获得您的头像、昵称，建议您允许以便我们为您提供更好的服务'
    },
    modalHidden: {
      type: Boolean,
      value: true
    },

  },

  /**
   * 组件的初始数据
   */
  data: {
    appName: '',
    logo:'/images/tabbarimg/info.png'
  },
  ready(){
    this.setData({
      appName: app.globalData.AppName,
      logo: app.globalData.siteinfo.imgUrl + app.globalData.storeLogo
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    getUserInfo(e) {
      CommonService.getUserInfo(e.detail, () => {
        this.setData({
          modalHidden: true
        })
        let myEventDetail = {}; // detail对象，提供给事件监听函数
        let myEventOption = {}; // 触发事件的选项
        this.triggerEvent('userInfoSuc', myEventDetail, myEventOption);
      })
    }
  }
})