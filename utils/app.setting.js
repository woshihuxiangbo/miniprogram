/**
 * 通用配置
 */
import commonService from './common.js';
export default {
  //获取授权信息
  settings: null,
  getSetting() {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: res => {
          this.settings = res.authSetting;
          resolve(res)
        }
      })
    })

  },
  // 获取用户地理位置
  getUserLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'wgs84',
        success: res => {
          getApp().globalData.location = res;
          resolve(res)
        },
        fail: err => {
        }
      })
    })
  }
}