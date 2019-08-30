// pages/myTeam2/myTeam2.js
import wxRepuest from '../../utils/wxrq.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    leveList: null,
    currentLeveId: null,
    currentUserId: null,
    header: "",
    userName: "",
    personageAmount: "",
    personageTeamCount: 0,
    personageTeamAmount: "",
    parentName: "",

    teamList: [],
    prevBtn:false,
    cache: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getList();
  },

  swichTab(e) {
    let id = e.currentTarget.dataset.id;
    if (id != this.data.currentLeveId) {
      this.setData({
        currentLeveId: id,
        teamList:[],
      })
      this.page = 1;
      this.totle_page = null;
      this.getList(id, this.prevUesrId);
    }
  },
  page: 1,
  totle_page: null,
  getList(level, userId) {

    let data = {};
    level && (data.level = level); //  有level 就传level参数
    userId && (data.userId = userId); //  有userId 就传userId参数
    data.pageNum = this.page;
    data.pageSize = 10;


    // if (this.totle_page && this.page > this.totle_page) {
    //   this.setData({
    //     isLast: true
    //   })
    //   return;
    // }

    wxRepuest.myTeam(data).then(res => {
      
      let teamList = res.data.data.pageUserTeamRelationList.list || [];

      this.data.teamList.length && this.data.teamList.concat(teamList);
      let info = res.data.data;
     
      if (!this.level) {
        this.level = info.level;    
        this.setData({
          currentLeveId: info.level
        })
        this.getTab(this.level);
      }
      

      this.setData({
        teamList: [...this.data.teamList, ...teamList],
        header: info.header,
        userName: info.userName,
        personageAmount: info.personageAmount,
        personageTeamCount: info.personageTeamCount,
        personageTeamAmount: info.personageTeamAmount,
        parentName: info.parentName,
      })
      this.totle_page = Math.ceil(res.data.data.pageUserTeamRelationList.total / 10);
      this.page++;
    })
  },
  getTab(level) {
    let leveList, lvConfig = wx.getStorageSync('lvConfig');
    switch (level * 1) {
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
  onReachBottom() {
    this.getList(this.data.currentLeveId);
  },
  gomy_team(e) {
    let userId = e.currentTarget.dataset.userid;
    let level = e.currentTarget.dataset.level;
    wx.navigateTo({
      url: `/pages/my_team/my_team?userId=${userId}&level=${level}`,
    })
  },
  // 下一级的数据
  clickNum:0,
  getNextData(options){
    this.page = 1
    this.clickNum +=1
    
    this.setData({
      teamList:[],
      prevBtn:true
    })
    let level = options.currentTarget.dataset.level
    let userId = options.currentTarget.dataset.userid
    this.prevLevel = level        // 缓存当前level
    this.prevUesrId = userId      // 缓存当前userId
    this.data.cache.push({
      level: this.data.currentLeveId,
      userId: this.data.currentUserId,
      userLevel: this.level
    })
    this.data.currentUserId = userId

    this.getTab(level)
    this.getList(level, userId)
  },
  // 获取上页数据
  getPrevData(){
    let cache = this.data.cache.pop();
    this.clickNum -=1
    if(this.clickNum == 0){
      this.setData({
        prevBtn:false,
      })
      this.prevUesrId = null
    }

    this.page = 1
    this.setData({
      teamList:[],
      currentLeveId: cache.level  // 返回后 让 tab选中第一个
    })
    this.prevLevel = cache.level        // 缓存当前level
    this.prevUesrId = cache.userId      // 缓存当前userId
    this.data.currentLeveId = cache.level;
    this.data.currentUserId = cache.userId;
    this.getTab(cache.userLevel);
    this.getList(cache.level, cache.userId)
  },

})