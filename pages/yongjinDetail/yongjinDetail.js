// pages/generalizeDetail/generalizeDetail.js
import WXRQ from "../../utils/wxrq.js"
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ossUrl: '',
    info: {},
    lvConfig: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      ossUrl: app.globalData.siteinfo.imgUrl,
      lvConfig: wx.getStorageSync('lvConfig')
    })
    this.getData(options.id,options.type)
    
  },
  getData(id,type) {
    WXRQ.getYongMeney(id,type).then(res => {
      this.setData({
        info: res.data.data
      })
    })
  },
})