import WXRQ from "../../utils/wxrq.js"
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ossUrl: null,
    info: {},
    lvConfig:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      ossUrl: app.globalData.siteinfo.imgUrl,
      lvConfig: app.globalData.lvConfig,
    })
    this.getData(options.id)
  },
  getData(id) {
    WXRQ.getConsumeDetail(id).then(res => {
      this.setData({
        info: res.data.data
      })
    })
  },
})