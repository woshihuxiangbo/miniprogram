import wxrq from '../../utils/wxrq.js'

Page({
  data: {
    moneyData: {
      incomeAmount: 0, // 佣金收益余额
      prestore: 0, // 预存款金额
      buyAmount: 0, //累计金额
      incomeTotal: 0, //累计收益
      level: 0,
    },
    flag: false,
  },


  goHero() {
    wx.showToast({
      title: '敬请期待',
      icon: 'none',
      duration: 2000
    })
  },
  levelname: '',
  onLoad(e) {
    this.levelname = e.levelname
    const self = this;
    this.getCommission();
    //  检查总监/合伙人的 预存款是否低于10%
    wxrq.getCheckDeposit().then(res => {
      if (res.data.code === 200 && res.data.data === true) { // data 为true 是低于10% 弹窗
        wx.showModal({
          title: '溫馨提示',
          content: `亲爱的${this.levelname}，您的预存款余额已不足10%，为了保障您的收益实时到账，请及时充值.`,
          showCancel: false,
          confirmText: '我知道了',
        })
      }
    })
  },
  //获取佣金
  getCommission() {
    wxrq.userrelationmoney().then((res) => {
      this.setData({
        moneyData: res.data.data
      })
    })
  },
  onShow() {
    if (this.withdrawed) { //如果去了提现页面，理论上存在金额变动的可能，所以重新获取
      this.getCommission();
      this.withdrawed = null;
    }

  },
  gowithdraw() {
    console.log(this.data.moneyData)
    wx.navigateTo({
      url: `/pages/withdraw/withdraw?level=${this.data.moneyData.level}`,
      success: res => {
        this.withdrawed = true;
      }
    })
  },
  gorecharge() {
    if (this.data.moneyData.level == 2 || this.data.moneyData.level == 3) {
      wx.navigateTo({
        url: `/pages/recharge/recharge?prestore=${this.data.moneyData.prestore}`,
        success: res => {
          this.withdrawed = true;
        }
      })
    } else {
      wx.showToast({
        title: '不能充值预存款',
        icon: 'none'
      })
    }
  },
  goedit_store() {
    if (this.data.moneyData.level != 9 && this.data.moneyData.level != 10) {
      wx.navigateTo({
        url: '/pages/edit_store/edit_store',
      })
    } else {
      wx.showToast({
        title: '你还没有店铺',
        icon: 'none'
      })
    }
  },
  gostore_code() {
    if (this.data.moneyData.level != 9 && this.data.moneyData.level != 10) {
      wx.navigateTo({
        url: '/pages/store_code/store_code',
      })
    } else {
      wx.showToast({
        title: '你还没有店铺',
        icon: 'none'
      })
    }

  }
})