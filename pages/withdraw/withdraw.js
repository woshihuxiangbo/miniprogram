// pages/withdraw/withdraw.js
import wxRepuest from '../../utils/wxrq.js';
import WithdrawProgressList from '../../model/withdrawProgress.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    yuMoney: 0,
    canMoney: 0,
    type: 1, // 1 提现 2转预存款
    actualTotalAmount: 0,
    awaitTotalAmount: 0,
    moreTipsHidden: true
  },
  radioChange(e) {
    let type = e.detail.value * 1;
    this.setData({
      type: type
    })
  },
  inpMeney(e) {
    let canMoney = e.detail.value
    this.setData({
      canMoney: canMoney
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //  {{shortName}}中心查询可提现金额
    if (options.level != 2 || options.level != 3) {
      this.setData({
        preDisabled: true
      })
    }
    wxRepuest.queryTiMoney().then(res => {
      if (res.data.data) {
        let yuMoney = res.data.data / 100 || 0;
        this.setData({
          yuMoney: yuMoney
        })
      }
    });
    this.getData();
  },
  onShow() {
    this.getWithdrawProgressList();
  },
  getData() {
    wxRepuest.getTncomeSummarizing().then(res => {
      let moneyData = res.data.data
      this.setData({
        actualTotalAmount: moneyData.actualTotalAmount,
        awaitTotalAmount: moneyData.awaitTotalAmount,
      })
    })
  },
  // 提现
  flag: true,
  getMoney() {
    if (this.flag) {
      this.flag = false
      if (this.data.canMoney < 1) {
        wx.showToast({
          title: '最低金额为1元',
          icon: 'none',
          duration: 2000
        })
        this.flag = true
      } else {
        wxRepuest.goTiMoney((this.data.canMoney * 100).toFixed(0), this.data.type).then(res => {
          this.flag = true
          if (res.data.code == 200) {
            this.setData({
              actualTotalAmount: this.data.actualTotalAmount - (this.data.canMoney * 100)
            })
            if (res.data.data != 0) {
              wx.navigateTo({
                url: `/pages/record/record?data=${res.data.data}&msg=${res.data.msg}&type=${this.data.type}`
              })
            } else {
              let msg = res.data.msg || '错误'
              wx.showToast({
                title: msg,
                icon: 'none',
                duration: 2000
              })
              this.getData()
            }
          }
        }).catch(err => {
          this.flag = true
        })
      }
      // ------------------
    }
  },
  getWithdrawProgressList() {
    wxRepuest.getWithdrawProgressList().then(res => {
      if (res.data.data && res.data.data.length > 0) {
        WithdrawProgressList.withdrawProgress = res.data.data;
        this.setData({
          moreTipsHidden: false
        })
      }
    }).catch(err => {
      console.error(err)
    })
  },
  gowithdrawProgress() {
    wx.navigateTo({
      url: '/pages/withdrawProgress/withdrawProgress'
    })
  }
})