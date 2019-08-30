import wxrq from '../../utils/wxrq.js'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    teamInfo:{
      buy_amount:0,
      buy_amount_tuan:0,
      nikename:'',
      tuan_size:0,
      levels:[],
      
    },
    lvConfig:{},

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      lvConfig: wx.getStorageSync('lvConfig')
    })
    wxrq.myTeam().then((res)=>{
      this.setData( {teamInfo:res.data.data})
    })
  },
  //  去看订单详情
  goTeamDetail(options){
    let formData = options.currentTarget.dataset.detail
    wx.navigateTo({
      url: `/pages/my_team/my_team?id=${JSON.stringify(formData)}`,
      
    })
  }
  
})