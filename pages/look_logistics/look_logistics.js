// pages/look_logistics/look_logistics.js
import WXRQ from '../../utils/wxrq.js';
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ossUrl: '',
    expressCompany: '',
    expressId: '',
    thumbnail: '',
    expressData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      ossUrl: app.globalData.siteinfo.imgUrl
    })
    WXRQ.getExpress(options.orderId).then(res => {
      let skepList = res.data.data.rows[0].status.data || []
      let sendTime = res.data.data.rows[0].sendTime
      let id = res.data.data.rows[0].id
      let timestamp = parseInt(new Date().getTime() / 1000)
      if (timestamp - sendTime > 1800) {
        WXRQ.getExpressDetail(id).then(res => {
          let newSkep = res.data.data.status.data || []
          this.setData({
            expressData: newSkep.reverse()
          })
        })
      }
      this.setData({
        thumbnail: res.data.data.thumbnail,
        expressCompany: res.data.data.rows[0].expressCompany,
        expressId: res.data.data.rows[0].expressId,
      })
      this.setData({
        expressData: skepList.reverse()
      })
    })
  },


})