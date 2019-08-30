// pages/my_card/my_card.js
import WXRQ from '../../utils/wxrq.js';
const STRSHORT = require('../../utils/strShort.js');
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    ossUrl: '',
    avatar: '',
    name: '',
    logo: '',
    sign: '',
    phone: '',
    tips: '赋能小主轻创业，社交新零售创业平台',

  },
  //保存
  savImg(e) {
    wx.authorize({ ///获取用户授权保存相册
      scope: 'scope.writePhotosAlbum',
      success: (res) => {
        if (this.tempFilePath) {
          this.savv();
        } else {
          this.readyImg();
        }
      },
      fail: res => {
        wx.setStorageSync('noPhotosAlbum', true);
        this.setData({
          noPhotosAlbum: true
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let logo = app.globalData.storeLogo;
    let ossUrl = app.globalData.siteinfo.imgUrl;
    this.setData({
      logo: logo ? (logo.startsWith('http') ? logo : ossUrl + logo) : "",
      tips: `赋能轻创业，社交新零售创业平台`,
      ossUrl: ossUrl
    })

    this.getCardInfo();
    this.req();
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
  storeId: '', //店铺 ID
  readyImg() { //准备图片材料
    wx.showLoading({
      title: '绘制中',
    })

    let p2 = this.dowloadFn(this.data.avatar || app.globalData.userInfo.avatarUrl); //下载商品缩略图
    p2.then((res) => {
      this.avatar = res;
    });
    let p3 = this.dowloadFn(this.data.logo); //下载logo
    p3.then(res => {
      this.logo = res;
    })

    Promise.all([p2, p3]).then(() => {
      this.drawCvs();
    }).catch(err => {
      console.error(err);
      this.drawCvs();
    })
  },
  // 获取二维码
  req() {
    return new Promise((resolve, reject) => {
      wx.showLoading({
        title: '加载中',
      })
      let uid = STRSHORT.Compress(wx.getStorageSync('uid'));
      // let storeId = STRSHORT.Compress(this.storeId);
      let myIsStore = wx.getStorageSync('myIsStore');
      // let myuid = wx.getStorageSync('uid');
      // let fuid = (myIsStore == '1') ? myuid : (app.globalData.storeInfo ? app.globalData.storeInfo.userId : myuid);
      // let uid = STRSHORT.Compress(fuid);
      let page;
      if (myIsStore == '1') {
        page = 'pages/my_store/my_store';
      } else {
        page = 'pages/index/index'
      }

      WXRQ.getQrcode({
        scene: `${uid}`,
        page: page,
        isHyaline: true,
        enable: false
      }, res => {
        // let base64Str = wx.arrayBufferToBase64(res.data.data); //对数据进行转换操作
        wx.getFileSystemManager().writeFile({
          filePath: `${wx.env.USER_DATA_PATH}/mycard`,
          data: res.data.data,
          encoding: "base64",
          success: res => {
            wx.getImageInfo({
              src: `${wx.env.USER_DATA_PATH}/mycard`,
              success: res => {
                wx.hideLoading();
                this.qrcode = res.path;
                this.setData({
                  qrcode: res.path
                })
                resolve();
              },
              fail: err => {
                reject(err)
              }
            })
          },
          fail: err => {
            reject(err)
          }
        })
      }, err => {
        reject('请求失败')
      })

    })
  },
  dowloadFn: function(src) { //下载临时路径
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url: src,
        success: (res) => {
          resolve(res.tempFilePath);
        },
      });
    });
  },
  drawCvs() { //画
    const ctx = wx.createCanvasContext('card', this);
    ctx.beginPath();
    ctx.clearRect(0, 0, 325, 425);
    ctx.drawImage('/images/poster/my_card.png', 0, 0, 345, 445); //背景图片
    if (this.qrcode) {
      ctx.drawImage(this.qrcode, 64, 125, 36, 36);
    }
    ctx.setFontSize(12);


    ctx.fillText(this.data.sign.slice(0, 11), 185, 145);
    if (this.data.sign.length > 11) {
      ctx.fillText(this.data.sign.slice(11, 22), 185, 161);
    }

    ctx.fillText(this.data.phone, 185, 178);
    ctx.setTextAlign('center')
    ctx.fillText(this.data.tips, 172.5, 390);
    ctx.setTextAlign('left')

    ctx.fillStyle = "#333333";
    ctx.font = 'normal bold 17px sans-serif';
    ctx.fillText(this.data.name.slice(0, 8), 185, 91);

    this.drawCircleImg(ctx, 55, 63, 54, 54, 4, this.avatar);
    this.drawCircleImg(ctx, 146, 300, 52, 52, 4, this.logo);

    ctx.draw(true, res => {
      this.timout = setTimeout(() => {
        clearTimeout(this.timout);
        wx.hideLoading();
        this.getCVS();
      }, 500)

    });
  },
  getCVS() { //生成临时路径
    wx.canvasToTempFilePath({
      fileType: 'jpg',
      canvasId: 'card',
      success: (res) => {
        this.tempFilePath = res.tempFilePath;
        this.savv();
      },
      fail: err => {
        console.error(err)
      }
    }, this)
  },
  savv() {
    wx.saveImageToPhotosAlbum({
      filePath: this.tempFilePath,
      success: () => {
        wx.showModal({
          title: '',
          content: '保存成功，赶紧将保存的图片晒一下吧～',
          showCancel: false,
          complete: () => {}
        })
      },
      fail: (err) => {
        console.error(err)
      }
    })
  },
  //绘制图片圆角
  drawCircleImg(ctx, x, y, w, h, r, img) { //ctx 画布  ,x,y 左上角坐标, r 半径 ，w 宽，h 高，img 图片
    ctx.save();
    ctx.beginPath();
    ctx.setStrokeStyle('transparent');
    ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2);
    ctx.lineTo(x + w, y + h - r);
    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5);
    ctx.lineTo(x + r, y + h);
    ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI);
    ctx.lineTo(x, y + r);
    ctx.stroke();
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  },

  // 获取名片信息
  getCardInfo() {
    let that = this
    WXRQ.queryNameCard().then(res => {
      let info = res.data.data;
      if (info) {
        that.setData({
          avatar: info.header,
          name: info.nikename,
          sign: info.signature,
          phone: info.mobile
        })
        this.storeId = info.store_id;
      }

      // that.setData({
      //   avatar: '',
      //   name: 'huxiang',
      //   logo: 'http://img.chuangxiaozhu.com/wxapp/icons/logo.png',
      //   sign: '不懂电商的人将无商可做',
      //   phone: '135814212121',
      //   tips: '赋能{{shortName}}轻创业，社交新零售创业平台'
      // })
    })
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



})