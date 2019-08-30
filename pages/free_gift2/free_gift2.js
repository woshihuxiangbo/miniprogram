// pages/free_gift2/free_gift2.js
import wxRepuest from '../../utils/wxrq.js'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ossUrl: '',
    shortName: '小主',
    indexData: {
      storeGift: []
    },
    eventType: '',
    articleId: '',
    keepTime: '',
    voiceSrc:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      fuid: options.fuid || '',
      shortName: app.globalData.shortName,
      ossUrl: app.globalData.siteinfo.imgUrl
    })
    const self = this
    //活动接口
    wxRepuest.getActivityList({type:6}).then((res) => {
      //获取活动礼包具体商品
      let length = res.data.data.rows.length
      let eventId = options.eventId || res.data.data.rows[length - 1].id
      let articleId = JSON.parse(res.data.data.rows[length - 1].rule).articleId
      let keepTime = JSON.parse(res.data.data.rows[length - 1].rule).keepTime
      let voiceSrc = res.data.data.rows[length - 1].voiceSrc || ''
      //let eventId = 5;
      self.setData({
        eventType: res.data.data.rows[length - 1].type,
        articleId: articleId,
        keepTime: keepTime,
        voiceSrc: voiceSrc,
      })
      wxRepuest.getActivityDetail({ eventId}).then((res) => {
        self.setData({
          'indexData.storeGift': res.data.data.rows
        })
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  }
})