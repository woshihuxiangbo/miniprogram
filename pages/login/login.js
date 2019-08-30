// pages/login/login.js
import WXRQ from '../../utils/wxrq.js';
import siteinfo from "../../siteinfo.js";
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    AppName: '',
    storeLogo: '',
  },
  getUserInfo(e) {
    if (e.detail.errMsg == "getUserInfo:ok") {
      WXRQ.authorizedLogin(e.detail).then(res => {
        let keys = Object.keys(this.options),
          str = '';
        for (let i = 0; i < keys.length; i++) {
          str += `${str && '&'}${keys[i]}=${this.options[keys[i]]}`
        }

        wx.reLaunch({
          url: `/${this.options.route}?${str}`,
        })
        app.globalData.userInfo = e.detail.userInfo;
      }).catch(err => {
        console.error(err)
      })
    } else {
      wx.showModal({
        title: '温馨提示',
        content: '请允许授权，以便我们为您提供更好的服务。',
      })
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      ossUrl: app.globalData.siteinfo.imgUrl,
      AppName: app.globalData.AppName,
      storeLogo: app.globalData.storeLogo
    })
    this.options = options;
  }
})