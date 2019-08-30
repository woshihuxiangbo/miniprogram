// pages/coupon/coupon.js
import wxRepuest from "../../utils/wxrq.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
     list:[],
     listShow:true,
     indexs:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList(0)
  },
  //  获取代金券列表
  getList(i){
    wxRepuest.queryOrderGain(i).then(res => {
      if (res.data.data && res.data.data.length > 0) {
        let list = res.data.data
        this.setData({ list: list,listShow: true })
      } else {
        this.setData({ list:[], listShow: false })
      }
    })
  },
  selectOpt(e){
     let i = e.target.dataset.i;
     this.setData({ indexs:i})
     this.getList(i)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

})