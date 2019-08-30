// pages/goods_group/goods_group.js
import Service from '../../utils/service.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    group: [{
      avatar: 'http://img.chuangxiaozhu.com/wxapp/order_confirm/headimg.jpg',
      groupHead: true
    }, {
      avatar: 'http://img.chuangxiaozhu.com/wxapp/order_confirm/headimg.jpg'
    }, {
      avatar: ''
    }, {}, {}, {}, {}, {}]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    Service.startCountDate({
      endDate: [1551304117279],
      thisObj: this
    });
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
    Service.endCountDate();
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

  },

  goindex() {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  }
})