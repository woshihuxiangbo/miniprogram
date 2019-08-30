// pages/store_about/store_about.js
import wxRepuest from '../../utils/wxrq.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    viewId:'',
    detail:{},
    picture:[]
  },
  gotarget(e){
    this.setData({
      viewId:'target'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      ossUrl: app.globalData.siteinfo.imgUrl,
    })
    wxRepuest.getOne(options.id).then(res=>{
        this.setData({
          detail:res.data.data,
          picture: JSON.parse(res.data.data.picture)
        })
    })
  },
  
  
})