// pages/fans/fans.js
import wxrq from '../../utils/wxrq.js'
var more = true;
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lvConfig: wx.getStorageSync('lvConfig'),

    tab: [

    ],
    tabNum: 0,
    fansArr: [
      // {
      //   level:3,
      //   nickname:'一辈子哈哈',
      //   header:'xxx',
      //   createTime:'213123132',
      //   strTime:"201865021"
      // },
      // {
      //   level:3,
      //   nickname:'一辈子哈哈1',
      //   header:'xxx',
      //   createTime:'213123132',
      //   strTime:"201865021"
      // },
    ],
    count: 0,
    Height: 0,
    timeArr: ['半年', '一年'],
    showText: false,
    timeTXT: '本月',
    level: 3,
    type: 1,
    pageNum: 1
  },


  changeTab(e) {
    
    const self = this
    let Index = e.currentTarget.dataset.index
    self.setData({
      fansArr:[],
      tabNum: Index,
      pageNum:1
    })
    switch (Index*1) {
      case 0:
        this.setData({
          level: 3
        })
        this.getList(self.data.type, 3, self.data.pageNum, 10);
        break; // 3
      case 1:
        this.setData({
          level: 2
        })
        this.getList(self.data.type, 2, self.data.pageNum, 10);
        break; // 2
      case 2:
        this.setData({
          level: 1
        })
        this.getList(self.data.type, 1, self.data.pageNum, 10);
        break; // 1

      
      case 3:
        this.setData({
          level: 10
        })
        this.getList(self.data.type, 10, self.data.pageNum, 10);
        break; // 10

      case 4:  //访客

        this.setData({
          level: 9
        })
        this.getList(self.data.type, 9, self.data.pageNum, 10);
        break; // 10
    }
  },

  showBox() {
    const self = this
    more = !more;
    if (more == false) {
      self.data.Height = 80;
      self.data.showText = true,
        self.setData(self.data)
    } else {
      self.data.Height = 0;
      self.data.showText = false,
        self.setData(self.data)
    }
    self.setData({
      more: more,
    })
  },

  chooseTime(e) {
    const self = this
    let Index = e.currentTarget.dataset.index
    let timeTXT = self.data.timeArr[Index]
    more = !more;
    self.setData({
      showText: false,
      Height: 0,
      timeTXT: timeTXT,
      more: more,
      pageNum:1
    })
    if (self.data.timeTXT == '本月') {
      self.setData({
        timeArr: ['半年', '一年'],
        type: 1
      })
      this.getList(1, this.data.level, this.data.pageNum, 10)
    } else if (self.data.timeTXT == '半年') {
      this.getList(2, this.data.level, this.data.pageNum, 10)
      self.setData({
        timeArr: ['本月', '一年'],
        type: 2
      })
    } else if (self.data.timeTXT == '一年') {
      this.getList(3, this.data.level, this.data.pageNum, 10)
      self.setData({
        timeArr: ['本月', '半年'],
        type: 3
      })
    }
  },

  showMore() {
    const self = this


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let lvConfig = wx.getStorageSync('lvConfig');
    this.getList(1, 3, 1, 10)
    this.setData({
      tab: [lvConfig.lv3.name, lvConfig.lv2.name, lvConfig.lv1.name, lvConfig.lv10.name, lvConfig.lv9.name]
    })
  },

  /**
   * 浏览量列表
   * @param type 类型 1 本月 2 半年 3 一年
   * @param level 等级
   * @param pageNum 页数
   * @param pageSize 条数
   * @return
   */
  getList(type, level, pageNum, pageSize) {
    let that = this
    wxrq.queryVisitor(type, level, pageNum, pageSize).then((res) => {
      let list = res.data.data.visitvo
      let count = res.data.data.count || 0
      that.setData({
        count: count
      })

      that.setData({
        fansArr: list
      })
    }).catch((err) => {
      console.error(err)
    })
  },


  onReachBottom() {
    const self = this;
    let num = self.data.pageNum
    num++
    self.setData({ pageNum: num })
    wxrq.queryVisitor(self.data.type, self.data.level, self.data.pageNum, 10).then((res) => {
      let list = res.data.data.visitvo
      let newList = this.data.fansArr.concat(list)
      let count = res.data.data.count || 0
      self.setData({
        count: count
      })
      if(!list.length){
        wx.showToast({
          title: '没有更多数据了...',
          icon:'none',
          duration:1000
        })
      }else{
        self.setData({
          fansArr: newList
        })
      }
    }).catch((err) => {
      console.error(err)
    })
  },



})