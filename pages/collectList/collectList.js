import WXRQ from '../../utils/wxrq.js'
import Service from '../../utils/service.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ossUrl: null,
  },
  tap(e) {
    let type = e.target.dataset.type;
    switch (type) {
      case "share":
        this.shareTap(e.currentTarget.dataset.idx);
        break;
      case "store": //去商店
        wx.reLaunch({
          url: `/pages/my_store/my_store?userid=${e.currentTarget.dataset.userid}&type=goods`,
        })
        break;
      case "cancel": //取消收藏
        let dataset = e.currentTarget.dataset;
        this.cancelTap(dataset.skuid, dataset.eventtype, dataset.idx)
        break;
      default: //去商品详情
        if (e.currentTarget.dataset.isexpired) {
          wx.showToast({
            title: '商品已下架',
            icon: 'none'
          })
        } else {
          console.log(e.currentTarget.dataset.itemId)
          wx.navigateTo({
            url: `/pages/goodsDetail/goodsDetail?goodsId=${e.currentTarget.dataset.itemId}&skuId=${e.currentTarget.dataset.skuid}&eventType=${e.currentTarget.dataset.eventtype}`,
          })
        }
        break;
    }
  },
  //取消收藏
  cancelTap(skuId, eventType, idx) {
    wx.showModal({
      title: '提示',
      content: '确认删除该条收藏？',
      cancelText: '手滑了',
      confirmText: '删除',
      success: res => {
        if (res.confirm) {
          WXRQ.deleteCollect({
            skuId: skuId,
            eventType: eventType
          }).then(res => {
            this.data.list.splice(idx, 1);
            this.setData({
              list: this.data.list
            })
          }).catch(err => {
            console.error(err)
          })
        }
      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // wx.hideShareMenu()
    this.setData({
      ossUrl: app.globalData.siteinfo.imgUrl
    })
    this.getList();
  },
  totle_page: null,
  page: 1,
  getList() {
    if (this.totle_page && this.page > this.totle_page) {
      this.setData({
        isLast: true
      })
      return;
    }
    WXRQ.getCollectionList({
      page: this.page,
      pageSize: 10
    }).then((res) => {

      res.data.data && this.data.list && (this.data.list = this.data.list.concat(res.data.data.rows));

      this.setData({
        list: this.data.list || (res.data.data ? res.data.data.rows : null)
      })
      this.totle_page = Math.ceil(res.data.data.rowCount / 10);
      this.page++;
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
    this.getList();
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
        path: `/pages/goodsDetail/goodsDetail?fuid=${wx.getStorageSync('uid')}&skuId=${this.data.shareGoods.skuId}&eventType=1`
      }
    }
    return Service.shareObj();
  },
  //分享 包括右下角的分享 与 分享赚
  shareTap(idx) {
    this.setData({
      shareGoods: this.data.list[idx],
      shareBarShow: true
    })
    this.shareGoodsStatus = true;
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
  }

})