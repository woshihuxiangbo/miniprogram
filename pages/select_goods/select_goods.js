import wxRepuest from '../../utils/wxrq.js'
import PreOrder from '../../model/preOrder.js'
import CommonService from '../../utils/common.js';
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indexData: {
      storeGift: []
    },
    eventType: 6,
    imgUrl: '',

    causeid: -1,
    price: 0,
    skuId: ""
  },

  selectCause(e) {
    let id = e.currentTarget.dataset.causeid;
    this.setData({
      causeid: id,
      price: e.currentTarget.dataset.price,
      skuId: e.currentTarget.dataset.skuid,
      spuId: e.currentTarget.dataset.spuid
    })
  },

  goPay(e) {
    CommonService.getUserInfo(e.detail, res => {
      if (!this.data.getFreed) return;
      if (!this.store) return;
      if (this.data.getFreed == 2) {
        wx.showToast({
          title: '已领取过了，不要贪心哦',
          icon: 'none',
        })
        return;
      }
      if (this.data.skuId != '') {
        wxRepuest.submitPreOrder({
          userStores: [{
            gainUserId: app.globalData.fuid, //受益人 是店铺主人
            userStoreType: '1', //用户店铺类型  1 普通小店 2 团购小店
            userStoreId: this.store.id || '', //用户店铺id
            userStoreName: this.store.name || '', //用户店铺 名称
            items: [{
              count: 1,
              skuId: this.data.skuId,
              eventType: this.data.eventType, //1普通/2秒杀/3社区拼团/4砍价/5入店礼包/6免费领礼品
              spuId: this.data.spuId
            }]
          }],
          cart: false
        }).then(res => {
          PreOrder.preOrder = res.data.data;
          wx.navigateTo({
            url: '/pages/order_confirm/order_confirm?eventType=6',
            success: res => {
              this.data.getFreed = null;
            }
          })
        }).catch(err => {})
      } else {
        wx.showModal({
          title: '提示',
          content: '请选择商品后提交',
        })
      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getStore();
    this.fuid = options.fuid || '';
    this.setData({
      imgUrl: app.globalData.siteinfo.imgUrl,
    })
    const self = this
    //活动接口
    wxRepuest.getActivityList({type:6}).then((res) => {
      //获取活动礼包具体商品
      let length = res.data.data.rows.length
      let eventId = res.data.data.rows[length - 1].id
      self.setData({
        // eventType: res.data.data.rows[length - 1].type
        eventType: 6
      })
      wxRepuest.getActivityDetail({eventId}).then((res) => {
        self.setData({
          'indexData.storeGift': res.data.data.rows
        })
      })
    })
  },
  goDetail(e) {
    let dataset = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/goodsDetail/goodsDetail?eventType=6&skuId=${dataset.skuid}&goodsId=${dataset.itemid}&eventType=6&`,
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
    this.checkFree()
  },
  //检查是否领取过免费礼品
  //1 没有购买过 2购买过
  checkFree() {
    wxRepuest.checkFree().then(res => {
      this.setData({
        getFreed: res.data.data
      })

    }).catch(err => {
      console.error(err)
    })
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
  getStore() {
    let myIsStore = wx.getStorageSync('myIsStore');
    if (myIsStore == '1') { //我有店
      this.getStoreById(wx.getStorageSync('uid'))
    } else { //我没店
      CommonService.getOtherStore(cb => {
        if (app.globalData.storeInfo) {
          this.store = app.globalData.storeInfo;
        } else {
          this.getStoreById('')
        }
      })
    }
  },
  getStoreById(userId) {
    wxRepuest.getGoodsStore({
      userId: userId || '', //点的是谁的 链接
    }).then(res => {
      this.store = res.data.data;
    }).catch(err => {
      console.error(err)
    })
  },


})