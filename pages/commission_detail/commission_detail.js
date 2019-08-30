// pages/commission_detail/commission_detail.js
import wxRepuest from '../../utils/wxrq.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pickerOpen: true, // picker是否打开 三角图标
    date: {
      year: (new Date).getFullYear(),
      month: (new Date).getMonth() + 1,
    },
    types: {},
    payMoney: 0,
    totalMoney: 0,
    actualTotalAmount: 0,
    awaitTotalAmount: 0,
    active: 1,
    list: [],
    msg: '',


  },
  incomeType: 1,
  page: 1,
  totalPage: 1,
  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function(options) {
    let year = (new Date).getFullYear() + ''
    let month = ((new Date).getMonth() + 1)
    let query = {
      type: this.incomeType,
      year: year,
      month: month,
      page: this.page,
      pageSize: 10
    }
    this.getList(query)

  },
  tabSwitch(e) {
    this.page = 1
    this.totalPage = 1
    if (!e.target.dataset.id) return
    this.setData({
      active: e.target.dataset.id,
      list: []
    })
    this.incomeType = e.target.dataset.id
    let query = {
      type: this.incomeType,
      year: this.data.date.year,
      month: this.data.date.month,
      page: this.page,
      pageSize: 10
    }
    this.getList(query)

  },
  dateSelect: function(e) {
    this.page = 1
    this.totalPage = 1
    let dateStr = e.detail.value;
    let year = parseInt(dateStr.slice(0, 4)) + '';
    let month = parseInt(dateStr.slice(5, 8));
    this.setData({
      'date.year': year,
      'date.month': month,
      pickerOpen: true,
      list: []
    })
    let query = {
      type: this.incomeType,
      year: this.data.date.year,
      month: this.data.date.month,
      page: this.page,
      pageSize: 10
    }
    this.getList(query)
  },
  openPicker: function() {
    this.setData({
      pickerOpen: false
    })
  },
  cancelPicker: function() {
    this.setData({
      pickerOpen: true
    })
  },
  getList(query) {
    if (this.totalPage < this.page) {
      return
    }
    wxRepuest.getCommissionDetail(query).then((res) => {
      this.totalPage = Math.ceil(res.data.data.rowCount / 10)
      let newList = this.data.list.concat(res.data.data.rows || [])
      this.setData({
        payMoney: res.data.data.payMoney || 0,
        totalMoney: res.data.data.totalMoney || 0,
        actualTotalAmount: res.data.data.actualTotalAmount || 0,
        awaitTotalAmount: res.data.data.awaitTotalAmount || 0,
        types: res.data.data.types || [],
        list: newList
      })


    }).catch((err) => {})
  },
  onPullDownRefresh() {
    this.page = 1
    this.totalPage = 1
    this.setData({
      list: []
    })
    let query = {
      type: this.incomeType,
      year: this.data.date.year,
      month: this.data.date.month,
      page: 1,
      pageSize: 10
    }
    this.getList(query)
    wx.stopPullDownRefresh();
  },
  onReachBottom() {
    let query = {
      type: this.incomeType,
      year: this.data.date.year,
      month: this.data.date.month,
      page: ++this.page,
      pageSize: 10
    }
    this.getList(query)
  },


})