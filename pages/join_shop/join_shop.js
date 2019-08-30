// pages/join_shop/join_shop.js
import wxRepuest from '../../utils/wxrq.js';
const ossUrl = getApp().globalData.siteinfo.imgUrl
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ossUrl: ossUrl,
    AppName: null,
    equityList: ['经济效益', '无忧管理', '培训权益', '分享赚钱', '推广支持', '增值权益', '自购省钱', '无忧创业'],
    storeGift:[],
    lvConfig:{},
    
  },


  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // wx.setNavigationBarTitle({
    //   title: '加入'+app.globalData.lvConfig.lv1.name
    // })
    this.setData({
      lvConfig: app.globalData.lvConfig,
      AppName: app.globalData.AppName,
    })
    //活动接口
    wxRepuest.getActivityList(5).then((res) => {
      //获取入店礼包具体商品
      let eventId = res.data.data.rows[0].id
      wxRepuest.getActivityDetail(eventId).then((res) => {
   
        this.setData({
          // eventType: res.data.data.rows[0].type
          eventType: eventId
        })
        let result = []
        for (let i = 0; i < res.data.data.rows.length; i += 3) {
          result.push(res.data.data.rows.slice(i, i + 3))
        }
        this.setData({
          storeGift: result
        })
      })
    })
  },


})