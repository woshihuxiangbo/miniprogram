// pages/comment/comment.js
import wxrq from '../../utils/wxrq.js'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ossUrl: null,
    list: null,
    showList: true,
    btnShow: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: `${app.globalData.shortName}评价`,
    })
    this.setData({
      ossUrl: app.globalData.siteinfo.imgUrl,
    })
    if (options.itemId) {
      this.setData({
        btnShow: false
      })
      this.itemId = options.itemId;
      this.getGoodsComment();
    } else {
      this.getCommentList();
    }
  },

  //获取评论 商品详情来的
  page: 1,
  pageTotle: null,
  getGoodsComment() {
    if (this.pageTotle != null && (this.page > this.pageTotle)) {
      this.setData({
        isLast: true
      })
      return;
    }
    wxrq.getGoodsComment({
      itemId: this.itemId,
      page: 1,
      pageSize: 10
    }).then(res => {
      (this.data.list && this.data.list.length) || (this.data.list = []);
      res.data.data.rows && (this.data.list = this.data.list.concat(res.data.data.rows));
      this.setData({
        list: this.data.list,
        showList: this.data.list.length ? true : false
      })
      this.pageTotle = Math.ceil(res.data.data.rowCount / 10);
      this.page++;
    }).catch(err => {
      this.setData({
        showList: false
      })
      console.error(err)
    })
  },
  //获取评论
  getCommentList() {
    if (this.pageTotle != null && (this.page > this.pageTotle)) {
      this.setData({
        isLast: true
      })
      return;
    }
    wxrq.getCommentList({
      page: 1,
      pageSize: 10
    }).then((res) => {
      (this.data.list && this.data.list.length) || (this.data.list = []);

      res.data.data && res.data.data.rows && (this.data.list = this.data.list.concat(res.data.data.rows));
      this.setData({
        list: this.data.list,
        showList: this.data.list.length ? true : false
      })
      res.data.data && (this.pageTotle = Math.ceil(res.data.data.rowCount / 10));
      
      this.page++;
    }).catch((err) => {
      this.setData({
        showList: false
      })
      console.error(err)
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
   * 上拉触底
   */
  onReachBottom() {
    if (this.itemId) {
      this.getGoodsComment();
    } else {
      this.getCommentList();
    }
  }

})