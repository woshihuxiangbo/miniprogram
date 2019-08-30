// pages/shop_street/shop_street.js
import wxRepuest from '../../utils/wxrq.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeList:[],


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.userid = options.userid
    this.setData({
      ossUrl: app.globalData.siteinfo.imgUrl,
      ownerId: options.userid
    })
    this.getStreet({
      type:1,
      userId: options.userid
    })
  },

  // 店铺街
  getStreet(data) {
    wxRepuest.getStoreStreetList(data).then(res => {
      this.setData({
        storeList: res.data.data || []
      })
    })
  },

  searchgoods(e){
    this.setData({
      storeList:[]
    })
    this.getStreet({
      type: 1,
      userId: this.userid,
      name: e.detail.value
    })
  },
})