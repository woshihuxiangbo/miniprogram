// pages/generalizeDetail/generalizeDetail.js
import WXRQ from "../../utils/wxrq.js"
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ossUrl:'', 
    list:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      ossUrl: app.globalData.siteinfo.imgUrl
    })
    this.getData(options.id)
  },
  getData(id){
    WXRQ.getUserPromotionDetail(id).then(res=>{
        this.setData({
          list:res.data.data
        })
    })
  },
})