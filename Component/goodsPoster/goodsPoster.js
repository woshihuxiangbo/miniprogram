/**

 */
let STRSHORT = require('../../utils/strShort.js');
import WXRQ from '../../utils/wxrq.js';
let app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    noPhotosAlbum: {
      type: Boolean,
      value: true,
    },
    doCvs: {
      type: Boolean,
      value: false,
      observer(newVal, oldVal, changedPath) {
        this.readyImg();
      }
    },
    eventType: { //1普通/2秒杀/3社区拼团/4砍价/5入店礼包/6免费领礼品
      type: String,
      value: '1'
    },
    goodsImg: { //商品图片数组
      type: String,
      value: ''
    },
    goodsTitle: { //商品名称
      type: String,
      value: ''
    },
    goodsDesc: { //商品描述
      type: String,
      value: ''
    },
    price: { //商品价格
      type: String,
      value: ''
    },
    marketPrice: { //商品市价
      type: String,
      value: ''
    },
    itemId: { //商品Id
      type: String,
      value: ''
    },
    skuId: {
      type: String,
      value: ''
    },
    ownerId: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    icon: ['/images/poster/poster_1.png', '/images/poster/poster_2.png', '/images/poster/poster_3.png', '/images/poster/poster_4.png']
  },

  /**
   * 组件的方法列表
   */
  methods: {
    readyImg() { //准备图片材料

      wx.showLoading({
        title: '绘制中',
      })

      if (this.data.eventType == 3) { //团购商品
        this.topTxt = ['优质好物', '厂家直供', '拼着买，更划算', '求欣赏，求带走']
      } else {
        this.topTxt = ['正品保证', '假一罚十', '7天内退换', '求欣赏，求带走']
      }

      let p1 = this.req(); //下载小程序码

      let p2 = this.dowloadFn(this.data.goodsImg); //下载商品缩略图
      p2.then((res) => {
        this.goodsImg = res;
      });
      Promise.all([p1, p2]).then(() => {
        this.drawCvs();
      }).catch(err => {
        if (this.goodsImg) {
          this.drawCvs();
        }
        console.error(err)
      })
    },
    // 获取二维码
    req() {
      return new Promise((resolve, reject) => {
        let myIsStore = wx.getStorageSync('myIsStore');
        let myuid = wx.getStorageSync('uid');
        let fuid = this.data.ownerId || ((myIsStore == '1') ? myuid : (app.globalData.storeInfo ? app.globalData.storeInfo.userId : myuid));

        let uid = STRSHORT.Compress(fuid);
        let skuId = STRSHORT.Compress(this.data.skuId);
        console.log(`${uid},${skuId},${this.data.eventType}`)
        WXRQ.getQrcode({
          scene: `${uid},${skuId},${this.data.eventType}`,
          enable: false, ///是否启用后台缓存参数
          page: 'pages/goodsDetail/goodsDetail'
        }, res => {
          // let base64Str = wx.arrayBufferToBase64(res.data.data); //对数据进行转换操作
          let FileSystemManager = wx.getFileSystemManager();
          let filePath = `${wx.env.USER_DATA_PATH}/qrcode`;
          try {
            FileSystemManager.mkdirSync(filePath); //創建目錄
          } catch (e) {}
          let str = Date.now();
          FileSystemManager.writeFile({
            filePath: filePath + '/' + str,
            data: res.data.data,
            encoding: "base64",
            success: res => {
              wx.getImageInfo({
                src: filePath + '/' + str,
                success: res => {
                  this.qrcode = res.path;
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

    drawCvs() { //画
      const ctx = wx.createCanvasContext('cvs', this);
      ctx.beginPath();
      ctx.clearRect(0, 0, 345, 490);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, 345, 490);
      ctx.fillStyle = "#df625c";
      ctx.fillRect(0, 0, 345, 27);
      ctx.drawImage(this.goodsImg, 0, 27, 345, 340); //商品图片
      ctx.drawImage(this.data.icon[0], 10, 8, 12, 12);
      ctx.setFontSize(10);
      ctx.fillStyle = "#fff";
      ctx.fillText(this.topTxt[0], 26, 18);
      ctx.drawImage(this.data.icon[1], (this.data.eventType == 3 ? 79 : 86), 8, 12, 12);
      ctx.fillText(this.topTxt[1], (this.data.eventType == 3 ? 93 : 100), 18);
      ctx.drawImage(this.data.icon[2], (this.data.eventType == 3 ? 145 : 160), 8, 12, 12);
      ctx.fillText(this.topTxt[2], (this.data.eventType == 3 ? 161 : 176), 18);
      ctx.drawImage(this.data.icon[3], 244, 8, 12, 12);
      ctx.fillText(this.topTxt[3], 260, 18);

      ctx.fillStyle = "#333333";
      ctx.font = 'normal bold 17px sans-serif';
      if (this.data.goodsTitle.length > 10) {
        ctx.fillText(this.data.goodsTitle.slice(0, 10) + '...', 20, 400);
      } else {
        ctx.fillText(this.data.goodsTitle.slice(0, 10), 20, 400);
      }
      ctx.fillStyle = "#999999";
      ctx.font = 'normal normal 12px sans-serif';
      if (this.data.goodsDesc && this.data.goodsDesc.length > 18) {
        ctx.fillText(this.data.goodsDesc.slice(0, 18), 20, 424);
        if (this.data.goodsDesc.length > 36) {
          ctx.fillText(this.data.goodsDesc.slice(20, 33) + '...', 20, 440);
        } else {
          ctx.fillText(this.data.goodsDesc.slice(20, 36), 20, 440);
        }
      } else {
        ctx.fillText(this.data.goodsDesc, 20, 424);
      }

      let font = "原价 ¥ " + (this.data.marketPrice * 1);

      ctx.fillText(font, 20, 469);
      ctx.setStrokeStyle('#666666');
      ctx.moveTo(18, 465);
      let len = 63;
      if (font.length > 5) {
        len += 7 * (font.length - 5)
      }
      ctx.lineTo(len, 465);
      ctx.stroke();
      if (this.qrcode) {
        ctx.drawImage(this.qrcode, 260, 385, 64, 64); //二维码
      }

      ctx.fillStyle = "#df625c";
      ctx.font = 'normal bold 17px sans-serif';
      let ltxt = this.data.eventType == 3 ? "团购价：" : "现价：";
      ctx.fillText(ltxt + "¥" + this.data.price, 101, 470);

      ctx.font = 'normal normal 12px sans-serif';
      ctx.fillText("长按二维码选购", 250, 466);
      ctx.draw(false, res => {
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
        canvasId: 'cvs',
        success: (res) => {
          this.setData({
            tempFilePath: res.tempFilePath,
            closeShow: true
          })
        }
      }, this)
    },
    save(e) {
      wx.authorize({ ///获取用户授权保存相册
        scope: 'scope.writePhotosAlbum',
        success: (res) => {
          wx.saveImageToPhotosAlbum({
            filePath: this.data.tempFilePath,
            success: () => {
              wx.showModal({
                title: '',
                content: '保存成功，赶紧将保存的图片晒一下吧～',
                showCancel: false,
                complete: () => {}
              })
              this.setData({
                closeShow: false
              })
              let myEventDetail = {}; // detail对象，提供给事件监听函数
              let myEventOption = {}; // 触发事件的选项
              this.triggerEvent('savsuc', myEventDetail, myEventOption);
            },
            fail: (err) => {
              console.error(err)
            }
          })
        },
        fail: res => {
          wx.setStorageSync('noPhotosAlbum', true);
          this.setData({
            noPhotosAlbum: true
          })
        }
      })
    },
    closeTap(e) {
      this.setData({
        closeShow: false,
        tempFilePath: ''
      })
      let myEventDetail = {}; // detail对象，提供给事件监听函数
      let myEventOption = {}; // 触发事件的选项
      this.triggerEvent('close', myEventDetail, myEventOption);
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
  }
})