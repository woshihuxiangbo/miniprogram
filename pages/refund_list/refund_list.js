// pages/refund_list/refund_list.js
import wxRepuest from '../../utils/wxrq.js';
let app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    ossUrl: '',
    info: null,
    show: false,
    shopName: '',
  },

  // 查看物流
  goLogistics() {
    wx.navigateTo({
      url: '/pages/look_logistics/look_logistics'
    })
  },
  // 去退款详情
  goReturn(e) {
    let reOrderId = e.currentTarget.dataset.id;
    let status = e.currentTarget.dataset.status;
    wx.navigateTo({
      url: `/pages/return/return?reOrderId=${reOrderId}&status=${status}`
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let shopName = wx.getStorageSync('shareInfo').shareTitle
    this.setData({
      shopName: shopName,
      ossUrl: app.globalData.siteinfo.imgUrl
    })
  },
  onShow: function(options) {
    this.page = 1;
    this.page_totle = null;
    this.getList()
  },
  page: 1,
  page_totle: null,
  getList() {
    wxRepuest.getRefundOrderList({
      pageNum: this.page,
      pageSize: 10
    }).then(res => {

      let data = res.data.data;
      this.data.info && data.list && this.data.info.concat(data.list);
      this.setData({
        info: this.data.info || data.list,
        show: (this.data.info && this.data.info.length) || data.list.length ? false : true
      })
      this.page++;
      this.page_totle || (this.page_totle = Math.ceil(data.totle / 10));
    }).catch(err => {
      this.setData({
        show: false
      })
    })
  },
  onReachBottom() {
    this.getList()
  }
})