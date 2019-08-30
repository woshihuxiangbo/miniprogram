// pages/edit_store/edit_store.js
import wxrq from '../../utils/wxrq.js'
import oss from '../../utils/oss.js';
import CommonService from '../../utils/common.js';
import clipData from '../../model/clipUrlArr.js';
let app=getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    ossUrl: '',
    sendform: {
      name: '',
      logo: '',
      backgroundId: 0,
      storeMobile: '',
      signature: '',
      id: '',
      backgroundImg :'',   // oss（多张图片用逗号隔开）
      virtualFan: '',   // 虚拟粉丝数
      virtualVisit: ''   // 虚拟访问数量
    },
    imgSrc: '',
    is_store: true,
  },
  bgcChange:false,
  picChange(){
      console.log('改变了')
    this.bgcChange = true
  },
  // 获取点击的哪张背景图
  closeThisPic(data){
    // console.log('点击了哪张:', data.detail)
    // console.log('xxx:',clipData.clipUrlArr)
    this.bgcChange = false
    this.setData({
      imgSrc: clipData.clipUrlArr[data.detail],
      'sendform.backgroundId': data.detail,
      'sendform.backgroundImg': clipData.clipUrlArr.join()
    })
  },
  upbgi(data){
    // console.log('裁剪前:', data.detail)
    wx.redirectTo({
      url: `../upload/upload?src=${data.detail}`
    })
  },
  //选择logo
  chooseLogo() {
    const self = this
    wx.chooseImage({
      count: 1,
      sizeType: 'compressed',
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePaths = res.tempFilePaths
        let options = {
          type: 7,
          ID: wx.getStorageSync('uid'),
        }
        //  oss -------
        oss.getOssData(options).then((ossData) => {
          oss.upPicFile(ossData.ossUrl, ossData.ossObj, tempFilePaths).then((data) => {
            self.setData({
              'sendform.logo': self.data.ossUrl+data[0]
            })
          })
        })
        //  oss -------

      }
    })
  },

  
  //电话
  phone(e) {
    this.setData({
      'sendform.storeMobile': e.detail.value
    })
  },
  signature(e) {
    this.setData({
      'sendform.signature': e.detail.value
    })
  },
  name(e) {
    this.setData({
      'sendform.name': e.detail.value
    })
  },
  virtualVisit(e) {
    this.setData({
      'sendform.virtualVisit': e.detail.value
    })
  },
  virtualFan(e) {
    this.setData({
      'sendform.virtualFan': e.detail.value
    })
  },
  //提交
  submit() {
    if (this.bgcChange) {   // 当删除了当前图片，backgroundId需要变化
      wx.showToast({
        title: '请从新选择店铺背景图',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    wxrq.editorStore(this.data.sendform).then((res) => {
      if (res.data.code == 200) {
        wx.navigateBack();
        CommonService.checkMyStore(); //更新店铺状态
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log('裁剪后：',options.clipUrl)
    // console.log('裁剪后clipUrlArr:', clipData.clipUrlArr)
    this.setData({
      ossUrl: app.globalData.siteinfo.imgUrl,
      'sendform.backgroundImg': clipData.clipUrlArr.join()
    })

    wxrq.getStoreMsg().then((res) => {
      if (res.data.code == 200) {
        if (res.data.data) {
          let info = res.data.data
          if (info.logo) {
            info.logo = info.logo.startsWith('http') ? info.logo : this.data.ossUrl + info.logo;
          }
          this.setData({
            'sendform.name': info.name,
            'sendform.logo': info.logo || '',
            'sendform.signature': info.signature || '',
            'sendform.storeMobile': info.storeMobile || '',
            'sendform.id': info.id,
            'sendform.backgroundId': info.backgroundId,
            'imgSrc': res.data.data.list[info.backgroundId] ? res.data.data.list[info.backgroundId].imgUrl:'' ,
            'sendform.backgroundImg': clipData.clipUrlArr.join(),
            'sendform.virtualVisit': info.virtualVisit || '',
            'sendform.virtualFan': info.virtualFan || '',
          })
          //  接口返回的图片数组存入 clipData.clipUrlArr
          if (clipData.clipUrlArr.length == 0){
            clipData.clipUrlArr = res.data.data.list.map((item) => {
              return item.imgUrl
            })
          }

          // console.log('返回的数据传入clipUrlArr:', clipData.clipUrlArr)
          //  接口返回的图片数组存入 clipData.clipUrlArr

        } else {
          self.setData({
            is_store: false
          })
        }
      }
    })
  },


})