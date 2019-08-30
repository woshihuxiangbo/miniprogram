// pages/message/message.js
import wxrq from '../../utils/wxrq.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    category: ['全部', '账户通知', '物流订单', '优惠活动', '代金券'],
    currentItem: 0,
    list: null
  },
  //  用户消息:0全部/1账户通知/2交易物流/3优惠活动
  swichTap(e) {
    let idx = e.currentTarget.dataset.idx * 1;
    if (idx != this.data.currentItem) {
      this.setData({
        currentItem: idx,
        isLast: false
      })
      this.data.list = null;
      this.page = 1;
      this.page_totle = null;
      this.getList();
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getList() // 获取全部
  },
  page: 1,
  page_totle: null,
  getList() {
    if (this.page_totle && this.page_totle < this.page) {
      this.setData({
        isLast: true
      })
      return;
    }
    wxrq.getNotice({
      size: 10,
      page: this.page,
      type: this.data.currentItem
    }).then(res => {
      this.data.list && (this.data.list = this.data.list.concat(res.data.data.rows))
      this.setData({
        list: this.data.list || res.data.data.rows,
        views: res.data.data.views
      })
      this.page_totle || (this.page_totle = Math.ceil(res.data.data.rowCount / 10));
      this.page++;
    }).catch((err) => {
      console.error(err)
    })
  },
  onReachBottom() {
    this.getList();
  }
})