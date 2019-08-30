// pages/popOrder/popOrder.js
import wxRepuest from '../../utils/wxrq.js';
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ossUrl: '',
    currentItem: 0,
    list: [],
  },
  page: 1,
  totalPage: 1,
  swichTab(e) {
    this.page = 1
    this.totalPage = 1
    let item = e.currentTarget.dataset.item;
    this.setData({
      currentItem: item * 1,
      list: []
    })
    this.userpromotiondetail(item)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      ossUrl: app.globalData.siteinfo.imgUrl
    })
    this.userpromotiondetail(0)
  },

  userpromotiondetail(status) {
    if (this.totalPage < this.page) {
      return
    }
    let query = {
      status: status,
      page: this.page,
      pageSize: 20,
    }
    wxRepuest.queryPromotiondetail(query).then(res => {
      this.totalPage = Math.ceil(res.data.data.rowCount / 20)
      let newList = this.data.list.concat(res.data.data.rows || [])
      this.setData({
        list: newList
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },
  onReachBottom() {
    this.page++
      this.userpromotiondetail(this.data.currentItem)
  },

})