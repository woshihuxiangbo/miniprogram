// pages/headnews/headnews.js
import wxRepuest from '../../utils/wxrq.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    headNews:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      ossUrl: app.globalData.siteinfo.imgUrl,
    })
    // 创小主头条数据
    wxRepuest.getHeadNews().then(res => {
      this.setData({
        headNews: res.data.data || []
      })
    })
  },
  goDetail(data){
    let title = data.currentTarget.dataset.title
    let body = data.currentTarget.dataset.body
    wx.navigateTo({
      url: `/pages/headnewsDetail/headnewsDetail?title=${title}&body=${encodeURIComponent(body)}`
    })
  },

 
})