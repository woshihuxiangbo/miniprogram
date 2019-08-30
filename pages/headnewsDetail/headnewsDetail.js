// pages/headnewsDetail/headnewsDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:'',
    body:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      title:options.title,
      body: decodeURIComponent(options.body).replace(/\<img/gi, '<img style="max-width:100%;height:auto"')
    })
  },

  
})