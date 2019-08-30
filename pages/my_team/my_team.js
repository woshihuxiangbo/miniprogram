// pages/my_team/my_team.js
import WXRQ from '../../utils/wxrq.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lvConfig: {},
    leveList:[],
    teamList:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    this.userId = options.userId
    this.level = options.level
    this.getTab()
    that.setData({
      lvConfig: wx.getStorageSync('lvConfig')
    })
    
    this.getList(options.userId);
  },
  page: 1,
  totle_page: null,
  getTab() {
    let leveList, lvConfig = wx.getStorageSync('lvConfig');
    switch (this.level * 1) {
      case 3:
        leveList = [{
          id: 3,
          txt: lvConfig.lv3.name
        }, {
          id: 2,
          txt: lvConfig.lv2.name
        }, {
          id: 1,
          txt: lvConfig.lv1.name
        }]
        break;
      case 2:
        leveList = [{
          id: 2,
          txt: lvConfig.lv2.name
        }, {
          id: 1,
          txt: lvConfig.lv1.name
        }]
        break;
      case 1:
        leveList = [{
          id: 1,
          txt: lvConfig.lv1.name
        }]
        break;
    }
    this.setData({
      leveList: leveList
    })

  },
  getList(id) {
    let data = {};
    id && (data.userId = id);
    data.pageNum = this.page;
    data.pageSize = 10;
    data.level = this.level
    WXRQ.myTeam(data).then(res => {
      let teamList = res.data.data.pageUserTeamRelationList.list
      
      this.setData({
        teamList: this.data.teamList.concat(teamList)
      })
      this.page++;
    })
 
  },
  switchTab(e){
    this.page = 1
    this.setData({ teamList:[]})
    this.level = e.currentTarget.dataset.id
    this.getList(this.userId)
  },
  onReachBottom() {
    this.getList(this.userId);
  },


})