import wxrq from '../../utils/wxrq.js'
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tab: [

    ],
    tabNum: 0,
    fansArr: [{
        'avatar': '',
        'nickname': '你的终极粉丝'
      },
      {
        'avatar': '',
        'nickname': '你的初级粉丝'
      },
    ],
    level:'3',
    pageNum:1,
    userFans:[]
  },


  changeTab(e) {
    const self = this
    let Index = e.currentTarget.dataset.index
    self.setData({
      tabNum: Index,
      pageNum:1
    })
    switch (Index) {
      case 0:
        this.setData({
          level: 3
        })
        this.getList( 3, self.data.pageNum, 15);
        break; // 3
      case 1:
        this.setData({
          level: 2
        })
        this.getList(2, self.data.pageNum, 15);
        break; // 2
      case 2:
        this.setData({
          level: 1
        })
        this.getList(1, self.data.pageNum, 15);
        break; // 1
      case 3:
        this.setData({
          level: 10
        })
        this.getList(10, self.data.pageNum, 15);
        break; // 10
    }
  },

  /**
     * 粉丝列表
     * @param level 等级
     * @param pageNum 页数
     * @param pageSize 条数
     * @return
     */
  getList(level,pageNum,pageSize){
    const self = this
    wxrq.getFans(level, pageNum, pageSize).then((res) => {
      self.setData({
        fansNum: res.data.data.count,
        userFans: res.data.data.userFans
      })
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let lvConfig = wx.getStorageSync('lvConfig');
    const self = this;
    self.setData({
      tab: [lvConfig.lv3.name, lvConfig.lv2.name, lvConfig.lv1.name, lvConfig.lv10.name]
    })
    this.getList(self.data.level,1,15)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  onReachBottom() {
    const self = this;
    let num = self.data.pageNum
    num++
    self.setData({ pageNum: num })
    wxrq.getFans(self.data.level, self.data.pageNum, 15).then((res) => {
      if (!res.data.data.userFans.length) {
        wx.showToast({
          title: '没有更多数据了...',
          icon: 'none',
          duration: 1000
        })
      }else{
        self.setData({
          fansNum: res.data.data.count,
          userFans: [...this.data.userFans, ...res.data.data.userFans]
        })
      }
    })
  },


})