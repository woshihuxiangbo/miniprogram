// pages/ownerAdvantage/ownerAdvantage.js
import Service from "../../utils/service.js"
import WXRQ from '../../utils/wxrq.js';
import CommonService from '../../utils/common.js';
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    powerData: '',
    ossUrl: '',
    popShow: false, //支付成功的弹窗
    role: '', //角色
    shortName: '',
    AppName: '',
    flagItem: 0, //点击进入的收益身份
    currentLevel: null, //自己的身份
    title: '',
    term: {
      title: '哪些人适合成为创小主店主？',
      content: ['只要你有手机，只要你有赚钱的欲望', '无论你是上班白领还是实体老板，待产准妈亦或在校学生、网红大V、微商转型', '只要你热爱生活，只要你愿意分享，只要你有三五分钟的零碎时间，你就可以成为老板！']
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      ossUrl: app.globalData.siteinfo.imgUrl,
      flagItem: options.a, //点击的收益身份
      shortName: app.globalData.shortName,
      AppName: app.globalData.AppName,
      fuid: options.fuid || '',
    })
    this.getMaxMoney();
    this.setTitle();
    this.getPower();

    if (this.data.flagItem == 1) { //店主权益
      this.getStoreGift();
    }
    this.getConfig();
    this.getInfo();

  },
  setTitle() {
    let lvConfig = wx.getStorageSync('lvConfig');
    let lv = `lv${this.data.flagItem}`;
    let title = lvConfig[`${lv}`] ? lvConfig[`${lv}`].name : `${lvConfig.lv3.name}/${lvConfig.lv2.name}`;
    wx.setNavigationBarTitle({
      title: `${title}权益`
    })
  },
  getPower() { //获取权益
    WXRQ.getPower({
      level: this.data.flagItem
    }).then(res => {
      this.setData({
        powerData: res.data.data ? (res.data.data.content || "") : "",
      })
    }).catch(err => {
      console.error(err)
    })
  },
  //获取最大金额
  getMaxMoney() {
    WXRQ.getPower({
      level: 110
    }).then(res => {
      this.setData({
        maxMoneyData: res.data.data ? (res.data.data.content || "") : "",
        maxMoneyStatus: true
      })
    }).catch(err => {
      this.setData({
        maxMoneyStatus: true
      })
      console.error(err)
    })
  },

  getStoreGift() { //活动商品接口
    WXRQ.getActivityList({
      type: 5
    }).then((res) => {
      //获取入店礼包具体商品
      let eventId = res.data.data.rows[0].id
      WXRQ.getActivityDetail({
        eventId
      }).then((res) => {
        if (res.data.data.rows && res.data.data.rows.length) {
          let storeGift = [];
          for (let i = 0; i < res.data.data.rows.length; i += 3) {
            storeGift.push(res.data.data.rows.slice(i, i + 3))
          }
          this.setData({
            storeGift: storeGift
          })
        }
      })
    })
  },
  getFormId(e) {
    this.formId = e.detail.formId;
  },
  chongMoney(e) {
    // hidden = '{{!((flagItem==3 ||flagItem==32)&&(currentLevel!=3))}}'
    // hidden = '{{!((flagItem==2 ||flagItem==32)&&(currentLevel!=3) && (currentLevel!=2))}}'
    CommonService.getUserInfo(e.detail, res => {
      if (!this.data.maxMoneyStatus) return;
      let level = e.currentTarget.dataset.level;

      if ((level == 2 && (this.data.currentLevel == 2 || this.data.currentLevel == 3)) || (level == 3 && this.data.currentLevel == 3)) {
        wx.showToast({
          title: `你已经是${this.data.lvMoney["lv" + this.data.currentLevel].name}了`,
          icon: 'none'
        })
        return;
      }

      let money = `${this.data.lvMoney['lv' + level].price}`;
      if (this.data.maxMoneyData && this.data.maxMoneyData.maxMoney && money > this.data.maxMoneyData.maxMoney) {
        wx.showModal({ //换行符 \r\n
          title: '提示',
          content: this.data.maxMoneyData.overMoneyTips || '金额超出最大限额',
        })
        return;
      }
      Service.payMoney({
        url: 'order/pay/joinUser',
        data: {
          type: level,
          gainUserId: app.globalData.fuid, //唐 加，要算受益人，我一路带进来的受益人userid
          formId: this.formId,
        },
        success: res => {
          this.setData({
            popShow: true,
            role: `${this.data.lvMoney['lv' + level].name}`,
            currentLevel: level
          })
          WXRQ.payPCb(res.orderId).then(res => {
            CommonService.checkMyStore(); //更新店铺状态
          }).catch(err => {
            CommonService.checkMyStore(); //更新店铺状态
            console.error(err)
          })
        }
      })
    })
  },

  // 关闭恭喜弹窗
  closePop() {
    this.setData({
      popShow: false
    })
    if (!this.data.isTuan && this.data.currentLevel == 3) { //合伙人
      wx.navigateTo({
        url: '/pages/apply_regimental/apply_regimental',
      })
    }
  },
  //  获取lvConfig
  getConfig() {
    app.getConfig(res => {
      this.setData({
        lvMoney: JSON.parse(res.data.data.lvConfig)
      })
    })
  },
  //获取自己的等级
  getInfo() {
    WXRQ.userReationInfo().then(res => {
      this.setData({
        currentLevel: res.data.data.level,
      })
    }).catch(err => {
      console.error(err)
    })
    WXRQ.isLeader().then(res => {
      //  1 (不是团长)2(是团长不是第一次进入)3是团长第一次进入
      let leaderJudge = res.data.data.leaderJudge;
      this.setData({
        isTuan: (leaderJudge == 2 || leaderJudge == 3) ? true : false
      })
    }).catch(err => {
      console.error(err)
    })
  },

})