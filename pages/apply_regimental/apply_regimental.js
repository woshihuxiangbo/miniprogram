// pages/apply_regimental/apply_regimental.js
import WXRQ from '../../utils/wxrq.js';
import CommonService from '../../utils/common.js';
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ossUrl: '',
    btnshow: false,
  },
  goApplyForm(e) {
    // if (this.tuanStatus == 0) {
    //   wx.showToast({
    //     title: '您已是团长，不能进行申请',
    //     icon: 'none',
    //     duration: 2000
    //   })
    //   return
    // } else if (this.tuanStatus == 3) {
    //   wx.showToast({
    //     title: '等待审核中',
    //     icon: 'none',
    //     duration: 2000
    //   })
    //   return
    // } else if (this.tuanStatus == 4){
    //   wx.showToast({
    //     title: '您已经在该店铺街，不能重复申请',
    //     icon: 'none',
    //     duration: 2000
    //   })
    //   return
    // }
    if (!this.tuanStatus) {
      wx.showToast({
        title: this.msg,
        icon: 'none',
        duration: 2000
      })
      return;
    }
    CommonService.getUserInfo(e.detail, res => {
      wx.navigateTo({
        url: `/pages/apply_form/apply_form?tuanStatus=${this.tuanStatus}&${this.fuid ? ('fuid='+this.fuid):""}`,
      })
    })
  },
  onLoad: function(options) {
    CommonService.checkLoadFinsh(() => {
      options.fuid && (this.fuid = options.fuid)
      this.setData({
        ossUrl: app.globalData.siteinfo.imgUrl
      })
      this.getPower()
      // 判断店铺存不存在 //0 上架 1下架 2 为空 3 待审核 审核不通过为2
      WXRQ.getleaderExist({
        invtUserId: this.fuid || wx.getStorageSync('uid')
      }).then(res => {
        this.tuanStatus = res.data.data
        this.msg = res.data.msg || '错误'
      })
    })
  },
  getPower() { //获取权益
    WXRQ.getPower({
      level: 111
    }).then(res => {
      this.setData({
        powerData: res.data.data && res.data.data.content
      })
    }).catch(err => {
      console.error(err)
    })
  }

})