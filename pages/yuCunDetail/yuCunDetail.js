// pages/yuCunDetail/yuCunDetail.js
import WXRQ from "../../utils/wxrq.js"
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info:{},
    type:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     //1预存款充值/2普通商品购买扣除预存款/3下级充值扣除预存款
    this.setData({ 
        type: options.type,
        lvConfig: app.globalData.lvConfig,
      })
    switch (options.type*1){
      case 1: wx.setNavigationBarTitle({ 'title': '预存款充值'});break;
      case 2: wx.setNavigationBarTitle({ 'title': '购买扣除预存款'});break;
      case 3: wx.setNavigationBarTitle({ 'title': '下级充值扣除预存款'});break;
    }
    this.getData(options.id, options.type)
  },
  getData(id, type){
    WXRQ.getSaveMoneyDetatil(id, type).then(res=>{
        this.setData({
          info:res.data.data
        })
    }).catch(err=>{
       
    })
  },
})