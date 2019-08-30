// pages/gochannel/gochannel.js
import WXRQ from '../../utils/wxrq.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ossUrl: '',
    info:{
      flg:true,
      code:'',
    },
    lvConfig:{},
    name:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  previewImage: function (e) {
    wx.previewImage({
      urls: [this.data.ossUrl+this.data.info.code] 
    })
  }, 
  onLoad: function (options) {
    this.setData({
      lvConfig: app.globalData.lvConfig,
      name: options.name,
      ossUrl: app.globalData.siteinfo.imgUrl
    })
    if (options.level){
      let that = this
      WXRQ.getleveltuan(options.level).then(res => {
        let info = res.data.data
        if (info) {
          if (!info.flg){
            wx.navigateTo({
              url: '/pages/channels_group_null/channels_group_null',
            })
          }
          that.setData({ info: info })
        }


      }).catch(res => {

      })
    }
    
  },

  
})