// pages/order_finishied/order_finishied.js
import WXRQ from '../../utils/wxrq.js';
import Service from '../../utils/service.js';
import CommonService from '../../utils/common.js';
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    ossUrl: app.globalData.siteinfo.imgUrl,
    list: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // wx.hideShareMenu()
    console.log(options)
    this.activeList();
    this.setData({
      price: options.price,
      payMethod: options.payMethod,
      ossUrl: app.globalData.siteinfo.imgUrl,
    })
    this.orderId = options.orderId || '';
    WXRQ.payCb(options.orderId).then(res => {
      if (options.eventType == 5) { //入店礼包
        CommonService.checkMyStore(); //更新店铺状态
      }
    }).catch(err => {
      console.error(err)
      if (options.eventType == 5) { //入店礼包
        CommonService.checkMyStore(); //更新店铺状态
      }
    })
 
  },

  // 今日活动
  page: 1,
  totle_page: null,
  activeList() {
    if (this.totle_page && this.page > this.totle_page) return;
    WXRQ.getGoodsList({
      page: this.page,
      pageSize: 5,
      isRecommend: true
    }).then(res => {
      this.data.list && (this.data.list.concat(res.data.data.rows))
      this.setData({
        list: this.data.list || res.data.data.rows
      })
      this.totle_page = Math.ceil(res.data.data.rowCount / 5);
      this.page++;
    }).catch(err => {
      console.error(err)
    })
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  // 去首页
  goindex() {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },
  goOrderDetail() {
    if (this.orderId) {
      wx.navigateTo({
        url: `/pages/orderDetail/orderDetail?orderId=${this.orderId}`,
      })
    }
  },
  goGoodsDetail(e) {
    let type = e.target.dataset.share;
    if (type != 'share') {
      let skuId = e.currentTarget.dataset.id;
      let itemId = e.currentTarget.dataset.itemid;
      wx.navigateTo({
        url: `/pages/goodsDetail/goodsDetail?skuId=${skuId}&goodsId=${itemId}&eventType=1`,
      })
    }
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
    this.activeList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(e) {
    if (e.from == 'button' && this.shareGoodsStatus) {
      let myIsStore = wx.getStorageSync('myIsStore');
      let uid = wx.getStorageSync('uid');
      let fuid = (myIsStore == '1') ? uid : (app.globalData.storeInfo ? app.globalData.storeInfo.userId : uid);
      return {
        title: this.data.shareGoods.name,
        imageUrl: this.data.ossUrl + this.data.shareGoods.thumbnail,
        path: `/pages/goodsDetail/goodsDetail?fuid=${fuid}&skuId=${this.data.shareGoods.skuId}&eventType=1`
      }
    }
    return Service.shareObj();
  },
  //分享 包括右下角的分享 与 分享赚
  shareTap(e) {
    CommonService.getUserInfo(e.detail, res => {
      if (e.currentTarget.dataset.share == 'share') { //推荐商品的分享
        let data = this.data.list;
        for (let i = 0; i < data.length; i++) {
          if (data[i].skuId == e.currentTarget.dataset.skuid) {
            this.setData({
              shareGoods: data[i]
            })
            this.shareGoodsStatus = true;
            break;
          }
        }
      }
      this.setData({
        shareBarShow: true
      })
    })
  },
  savImg(e) {
    if (this.shareGoodsStatus) { //商品分享
      this.setData({
        doCvs: this.data.doCvs ? false : true
      })
    } else { //右下角分享
      this.setData({
        cvsShow: true
      })
    }

  },
  closePoster(e) {
    this.setData({
      shareBarShow: false
    })
    this.shareGoodsStatus = null;
  },
})