// pages/cancel_order/cancel_order.js
import Service from '../../utils/service.js';
import WXRQ from '../../utils/wxrq.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    causeid: 3, // 原因项id
    popShow: true,
  },
  //  选择不想要的原因
  selectCause(e) {
    let id = e.currentTarget.dataset.causeid;
    let text = e.currentTarget.dataset.text;
    this.setData({
      causeid: id,
      text: text
    })
  },
  // 确定原因
  confirm() {
    this.setData({
      popShow: false
    })
  },
  cancel() {
    this.setData({
      popShow: true
    })
  },

  // 取消订单  cancelOrder
  goCancelOrder() {
    WXRQ.cancelOrder({
      id: this.orderId,
      reason: this.data.text || '其他原因'
    }).then(res => {
      this.setData({
        popShow: true
      })
      wx.showToast({
        title: '取消成功',
        icon: 'none',
        success: res => {
          wx.navigateBack({})
        }
      })

    }).catch(err => {
      wx.showToast({
        title: '取消失败',
        icon: 'none'
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.orderId = options.orderId;
    options.type == 'detail' && (this.type = 'detail');
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

  },

})