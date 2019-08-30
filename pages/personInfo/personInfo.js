// pages/personInfo/personInfo.js
import CommonService from '../../utils/common.js';
import WXRQ from '../../utils/wxrq.js';
import AreaCode from '../../utils/areaCode.js';
import Oss from '../../utils/oss.js';
// import 
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    end: Date.now(),
    shortName: app.globalData.shortName,
    maskHidden: true,
    gender: ['男', '女'], //0未知 / 1男/2女
    region: [],
    userInfo: null
    //    {
    //   gender: 0,
    //   birthday: '',
    //   province: '',
    //   city: '',
    //   county: '',
    //   mobile: "",
    //   signature: '',
    //   wechatQrCode: ''
    // }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let askPhone = wx.getStorageSync('askPhone');
    WXRQ.getEditUserInfo().then(res => {
      let area;
      res.data.data.province && (area = AreaCode.codeToTxt([res.data.data.province, res.data.data.city, res.data.data.county]));
      this.setData({
        userInfo: res.data.data,
        region: area || [],
        maskHidden: !res.data.data.mobile && !askPhone ? false : true
      }, () => {
        wx.setStorageSync('askPhone', true);
      })
    }).catch(err => {
      console.error(err)
    })
  },
  //性别
  genderChange(e) {
    this.setData({
      genderIdx: e.detail.value
    })
  },
  // 日期
  dateChange(e) {
    this.setData({
      birthday: e.detail.value
    })
  },
  // 个性签名
  inputFinish(e) {
    this.talks = e.detail.value
  },
  storenameFinish(e) {
    this.storename = e.detail.value
  },
  addrFinish(e) {
    this.address = e.detail.value
  },
  // 地区
  regionChange(e) {
    this.regionCode = e.detail.code;
    this.setData({
      region: e.detail.value
    })
  },
  //授权手机号
  phoneDetail: [],
  getPhoneNumber(e) {
    this.setData({
      maskHidden: true
    })

    CommonService.getPhoneNumber(e.detail, res => {
      this.setData({
        mobile: res.data.data
      })
    });
  },
  //上传二维码
  upImg(e) {
    wx.chooseImage({
      count: 1,
      success: res => {
        let tempFilePaths = res.tempFilePaths;
        Oss.getOssData({
          type: 7,
          query: `ID=${wx.getStorageSync('uid')}`,
        }).then(res => {
          Oss.upPicFile(res.ossUrl, res.ossObj, tempFilePaths).then(res => {
            this.codeImg = res[0];
            this.setData({
              wccode: true
            })
            wx.showToast({
              title: '上传成功',
            })
          }).catch(err => {
            console.error(err)
          })
        })
      },
    })
  },
  cancelTap(e) {
    this.setData({
      maskHidden: true
    })
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
    WXRQ.saveUserInfo({
      gender: (this.data.genderIdx && this.data.genderIdx * 1 + 1) || 0,
      birthday: this.data.birthday || '',
      province: (this.regionCode && this.regionCode[0]) || '',
      city: (this.regionCode && this.regionCode[1]) || '',
      county: (this.regionCode && this.regionCode[2]) || '',
      signature: this.talks || '',
      wechatQrcode: this.codeImg || '',
      address: this.address || '',
      storename: this.storename || '',
    }).then(res => {
      CommonService.checkMyStore(); //更新店铺信息
    }).catch(err => {
      console.error(err)
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },


})