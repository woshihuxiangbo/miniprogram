// pages/gifts_articles/gifts_articles.js
import countDate from "../../utils/service.js";
import WXRQ from '../../utils/wxrq.js';
import Audio from '../../utils/audio.js';
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    AppName: null,
    shortName: null,
    countDown: [{
      minute: 0,
      second: 0
    }],
    comeBottom: false, //  是否到达底部
    countTimeEnd: false, //  倒计时是否结束
    btnCan: false, // 按钮变红 能够点击
    lvConfig: {},
    body: '',
    title: '',
    keepTime: '',
    getFreed: null,
    ossUrl: '',
  },
  //检查是否领取过免费礼品
  //1 没有购买过 2购买过
  checkFree(cb) {
    WXRQ.checkFree().then(res => {
      this.setData({
        getFreed: res.data.data
      })
      cb && cb();
      this.checkFreeCb && this.checkFreeCb();

    }).catch(err => {
      console.error(err)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      lvConfig: app.globalData.lvConfig,
      AppName: app.globalData.AppName,
      shortName: app.globalData.shortName,
      ossUrl: app.globalData.siteinfo.imgUrl,
    })

    Audio.audioPlay(this.data.ossUrl + options.voiceSrc, true);

    this.fuid = options.fuid || '';
    if (options.keepTime) {
      this.setData({
        keepTime: options.keepTime
      })
    }
    //获取文章
    WXRQ.getArticleOne(options.articleId || 0).then((res) => {
      this.setData({
        title: res.data.data.title,
        body: res.data.data.body.replace(/\<img/gi, '<img style="max-width:100%;height:auto"')
      })
    })
    this.checkFree();
  },
  onShow() {
    Audio.audioContinue();
    this.setData({
      btnCan: false
    })
    if (this.data.getFreed) {
      this.pageCountDate()
    } else {
      this.checkFreeCb = () => {
        this.pageCountDate()
      }
    }
  },
  pageCountDate() {
    if (this.data.getFreed == 2) return;
    let that = this
    countDate.startCountDate({
      endDate: [Date.now() + this.data.keepTime * 1000],
      thisObj: that,
      finished: function() {
        that.setData({
          countTimeEnd: true
        })
        if (that.data.countTimeEnd && that.data.comeBottom) {
          that.setData({
            btnCan: true
          })
        }
      }
    })
  },

  onHide() {
    countDate.endCountDate();
    Audio.audioPause();
  },
  onUnload() {
    Audio.audioDestroy();
  },
  // 监听用户上拉触底事件。(判断文章是否看完)
  onReachBottom: function() {
    this.setData({
      comeBottom: true
    }) // 到达底部 
    if (this.data.countTimeEnd && this.data.comeBottom) {
      this.setData({
        btnCan: true
      })
    }
  },
  // go
  goSelectGoods() {
    if (this.data.getFreed == 2) {
      wx.showToast({
        title: '已领取过了，不要贪心哦',
        icon: 'none',
        duration: 2000
      })
    } else if (this.data.btnCan) {
      wx.navigateTo({
        url: `/pages/select_goods/select_goods?fuid=${this.fuid}`,
        success: res => {
          this.goSelect = true;
        }
      })
    } else {
      wx.showToast({
        title: '请阅读文章至少3分钟',
        icon: 'none',
        duration: 2000
      })
    }
  }

})