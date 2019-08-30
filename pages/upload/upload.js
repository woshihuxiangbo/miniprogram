import WeCropper from '../../Component/we-cropper/we-cropper.js'
import clipData from '../../model/clipUrlArr.js';
import oss from '../../utils/oss.js';
const app = getApp()
const config = app.globalData.config

const device = wx.getSystemInfoSync()
const width = device.windowWidth
const height = device.windowHeight - 50

Page({
  data: {
    cropperOpt: {
      id: 'cropper',
      targetId: 'targetCropper',
      pixelRatio: device.pixelRatio,
      width,
      height,
      scale: 2.5,
      zoom: 8,
      cut: {
        x: (width - 300) / 2,
        y: (height - 300) / 2,
        width: 300,
        height:150
      },
      boundStyle: {
        color: config.getThemeColor(),
        mask: 'rgba(0,0,0,0.8)',
        lineWidth: 1
      }
    }
  },
  touchStart (e) {
    this.cropper.touchStart(e)
  },
  touchMove (e) {
    this.cropper.touchMove(e)
  },
  touchEnd (e) {
    this.cropper.touchEnd(e)
  },
  getCropperImage () {
    this.cropper.getCropperImage(function (path, err) {
      if (err) {
        wx.showModal({
          title: '温馨提示',
          content: err.message
        })
      } else {

        //  oss -------
        oss.getOssData({type: 7,ID: wx.getStorageSync('uid')}).then((ossData) => {
          oss.upPicFile(ossData.ossUrl, ossData.ossObj, [path]).then((ossArr) => {
            clipData.clipUrlArr.push(ossArr[0])
            console.log('上传oss后的数组:', clipData.clipUrlArr)
            wx.redirectTo({
              url: `../edit_store/edit_store`
            })
          })
        })
        //  oss -------
        
        
      }
    })
  },
  uploadTap () {
    const self = this

    wx.chooseImage({
      count: 1, 
      sizeType: ['compressed'], 
      sourceType: ['album', 'camera'], 
      success (res) {
        const src = res.tempFilePaths[0]

        self.cropper.pushOrign(src)
      }
    })
  },
  onLoad (option) {
    const { cropperOpt } = this.data

    cropperOpt.boundStyle.color = config.getThemeColor()

    this.setData({ cropperOpt })

    if (option.src) {
      cropperOpt.src = option.src
      this.cropper = new WeCropper(cropperOpt)
        .on('ready', (ctx) => {
     
        })
        .on('beforeImageLoad', (ctx) => {

          wx.showToast({
            title: '上传中',
            icon: 'loading',
            duration: 20000
          })
        })
        .on('imageLoad', (ctx) => {

          wx.hideToast()
        })
        .on('beforeDraw', (ctx, instance) => {

        })
    }
  }
})
