// pages/commission_detail/commission_detail.js
import wxRepuest from '../../utils/wxrq.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
      pickerOpen: true, // picker是否打开 三角图标
      date:{
        year: (new Date).getFullYear(),
        month: (new Date).getMonth()+1,
      },
      payMoney: 0,
      totalMoney: 0,
      list:[],
     msg:''
  },
  page: 1,
  totalPage: 1,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let year = (new Date).getFullYear()+''
    let month = ((new Date).getMonth() + 1) 
    this.getList({
      year: year,
      month: month,
      page: this.page,
      pageSize: 20
    })

  },

  dateSelect: function (e) {
    this.page = 1
    this.totalPage = 1
    let dateStr = e.detail.value;
    let year = parseInt(dateStr.slice(0, 4)) + '';
    let month = parseInt(dateStr.slice(5, 8));
    this.setData({ 
          list:[],
          'date.year': year, 
          'date.month': month,
          pickerOpen: true
       })
    this.getList({
      year: year,
      month: month,
      page: this.page,
      pageSize: 20
    })
  },
  getList(query){
    if (this.totalPage < this.page) {
      return;
    }
    wxRepuest.getFindbymoney(query).then((res) => {
      
      if (res.data.data.userDepositDetail) {
        this.setData({
          payMoney: res.data.data.payMoney||0,
          totelMoney: res.data.data.totelMoney||0,
        })
        let list = res.data.data.userDepositDetail
        this.totalPage = Math.ceil(res.data.data.rowCount / 20)
        let newList = this.data.list.concat(res.data.data.userDepositDetail || [])
        this.setData({ list: newList })
      } else {
        this.setData({
          msg: res.data.msg,
          list:[],
          payMoney: 0,
          totelMoney: 0,
        })
      }


    }).catch((err) => {
      // console.err('err')
    })
  },
  openPicker: function () {
    this.setData({
      pickerOpen: false
    })
  },
  cancelPicker: function () {
    this.setData({
      pickerOpen: true
    })
  },
  onPullDownRefresh() {
    this.setData({ list: [] })
    this.getList({
      year: this.data.date.year,
      month: this.data.date.month,
      page: 1,
      pageSize: 20
    })
    wx.stopPullDownRefresh();
  },
  onReachBottom() {
    this.getList({
      year: this.data.date.year,
      month: this.data.date.month,
      page: ++this.page,
      pageSize: 20
    })

  },

 
})