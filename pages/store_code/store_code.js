// pages/store_code/store_code.js
import WXRQ from '../../utils/wxrq.js';
const app = getApp();
Page({
  data: {
    posterTxt: null,
    ossUrl: '',
    AppName: '',
    nickName: '',
    avatar: '',
    info: {
      signature: '',
      store_mobile: '',
      storename: '',
      logo: ''
    },
    current: 0
  },
  onLoad: function() {
    let shareGroup = JSON.parse(wx.getStorageSync('shareInfo').shareGroup); //不能直接使用的海报数据
   
    // let posterRaw = [{
    //   src: 'https://koudeimg.oss-cn-shanghai.aliyuncs.com/pic/a.png',
    //   color: '#fff',
    //   fontColor: '#000',
    //   title: '赋能小主轻创业', // 主标题
    //   subtitle: '创业就上创小主', // 副标题
    //   footerText: '社交新零售轻创业首选平台' // 底部文字
    // }, {
    //   src: 'https://koudeimg.oss-cn-shanghai.aliyuncs.com/pic/b.png',
    //   color: '#fff'
    // }, {
    //   src: 'https://koudeimg.oss-cn-shanghai.aliyuncs.com/pic/c.png',
    //   color: '#fff'
    // }, {
    //   src: 'https://koudeimg.oss-cn-shanghai.aliyuncs.com/pic/d.png',
    //   color: '#fff'
    // }, {
    //   src: 'https://koudeimg.oss-cn-shanghai.aliyuncs.com/pic/e.png',
    //   color: '#000'
    // }];
    this.setData({
      ossUrl: app.globalData.siteinfo.imgUrl,
      posterRaw: shareGroup.constructor.name == "Array" ? shareGroup : shareGroup.store.poster
    })

    WXRQ.qureyer().then(res => {
      if (res.data.data.logo) {
        res.data.data.logo = res.data.data.logo.startsWith('http') ? res.data.data.logo : this.data.ossUrl + res.data.data.logo
      }
      this.setData({
        AppName: app.globalData.AppName,
        info: res.data.data || null,
        nickName: app.globalData.userInfo.nickName,
        avatar: app.globalData.userInfo.avatarUrl,
      }, () => {
        this.setData({
          cvsShow: true
        })
      })
    }).catch(err => {
      console.error(err)
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    wx.getSetting({
      success: res => {
        let noPhotosAlbum = wx.getStorageSync('noPhotosAlbum');
        if (res.authSetting['scope.writePhotosAlbum']) { //受过权
          noPhotosAlbum && wx.removeStorageSync('noPhotosAlbum');
          this.setData({
            noPhotosAlbum: false
          })
        } else { //没受过权
          if (noPhotosAlbum) { //询问过
            this.setData({
              noPhotosAlbum: noPhotosAlbum
            })
          } else { //没询问过
            this.setData({
              noPhotosAlbum: false
            })
          }
        }
      }
    })
  },
  //二维码 成功
  codeSuc(e) {
    this.setData({
      qrcode: e.detail.qrcode
    })
  },
  //海报完成
  cvsSuc(e) {
    this.tempFilePath = e.detail.tempFilePath;
  },
  //预览
  prevImg(e) {
    wx.previewImage({
      urls: [this.tempFilePath],
      fail: err => {
        console.error(err)
      }
    })
  }, 
  // 点击切换  ,会触发 滑动切换
  swichTap(e) {
    this.data.current++;
    this.setData({
      current: this.data.current >= this.data.posterRaw.length ? 0 : this.data.current
    })
  },
  // 滑动切换
  swichScroll(e) {
    this.setData({
      current: e.detail.current
    })

  }
})