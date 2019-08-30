import wxRepuest from '../../utils/wxrq.js';
Page({
  data: {
    pickerOpen: true, // picker是否打开 三角图标
    date: null,
    payMoney: 0,
    totalMoney: 0,
    list: [],
    active:0,
    addorsub:0
  },
  page: 1,
  totalPage: 1,
  onLoad: function(options) {
    let nowDate = new Date;
    let year = nowDate.getFullYear(),
      month = nowDate.getMonth() + 1;
    this.setData({
      date: {
        year: year,
        month: month
      }
    })
    this.getList(year, month,0)
  },
  tabSwitch(e){
    this.page = 1
    this.totalPage = 1
    if (!e.target.dataset.id) return
    this.setData({
      active: e.target.dataset.id,
      list:[]
    })
    if (e.target.dataset.id==0){
      this.setData({ addorsub:0})
      this.getList(this.data.date.year, this.data.date.month,0)
    }else{
      this.setData({ addorsub: 1 })
      this.getList(this.data.date.year, this.data.date.month,1)
    }
    

  },
  dateSelect: function(e) {
    this.page = 1
    this.totalPage = 1
    let dateStr = e.detail.value;
    let year = dateStr.slice(0, 4);
    let month = dateStr.slice(5, 8)*1;

    this.setData({
      list:[],
      date: {
        year: year,
        month: month
      },
      pickerOpen: true
    })

    this.getList(year, month,this.data.active)
  },
  // 支出
  // getZhiChu(year,month){
  //   wxRepuest.getDepositDetail({
  //     year: year,
  //     month: month,
  //   }).then((res) => {

  //     if (res.data.data.userDepositDetail) {
  //       this.setData({
  //         payMoney: res.data.data.payMoney||0,
  //         totalMoney: res.data.data.totalMoney||0,
  //       })
  //       let list = res.data.data.userDepositDetail
  //       this.setData({
  //         list: list
  //       })
  //     } else {
  //       this.setData({
  //         list: null,
  //         payMoney: 0,
  //         totalMoney: 0

  //       })
  //     }
  //   }).catch((err) => {
  //     console.error(err)
  //   })
  // },
  //  收入
  getList(year, month, addorsub) {
    if (this.totalPage < this.page) {
      return;
    }
    wxRepuest.getDeductList({
      year: year,
      month: month,
      addorsub: addorsub,
      page:this.page,
      pageSize:20
    }).then((res) => {
        
        this.totalPage = Math.ceil(res.data.data.rowCount / 20)
        let newList = this.data.list.concat(res.data.data.rows || [])
        this.setData({
          list: newList,
          payMoney: res.data.data.payMoney || 0,
          totalMoney: res.data.data.totalMoney || 0,
        })
    
    }).catch((err) => {
      console.error(err)
      this.setData({
        list: null,
        payMoney: 0,
        totalMoney: 0

      })
    })
  },
  /**
   * 选择日期
   */
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

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.page = 1
    this.setData({ list: [] })
    this.getList(this.data.date.year, this.data.date.month, this.data.addorsub)
    wx.stopPullDownRefresh();
  },
  /**
   * 上拉加载
   */
  onReachBottom() {
    
    this.page++
    this.getList(this.data.date.year, this.data.date.month, this.data.addorsub)

  },

});