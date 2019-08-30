// Component/storePoster/storePoster.js
let STRSHORT = require('../../utils/strShort.js');
import Service from '../../utils/service.js';
import WXRQ from '../../utils/wxrq.js';
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    storeType: {
      type: String,
      value: null
    },
    eventType: {
      type: String,
      value: null
    },
    domShow: {
      type: Number,
      value: false
    },
    noPhotosAlbum: {
      type: Boolean,
      value: undefined,
    },
    tableShow: { //显示
      type: Boolean,
      value: false,
      observer(newVal, oldVal, changedPath) {
        if (newVal) {
          this.readyOne();
        }
      }
    },
    avatar: { //头像
      type: String,
      value: ''
    },
    name: { //名字
      type: String,
      value: ''
    },
    phone: { //电话
      type: String,
      value: ''
    },
    sign: { //个性签名
      type: String,
      value: ''
    },
    storeId: { //店铺id
      type: String,
      value: ''
    },
    type: {
      type: Number,
      value: 0
    },
    current: {
      type: Number,
      value: 0,
      observer(newVal, oldVal, changedPath) {
        this.type = newVal * 1;
        this.readyImg();
      }
    },
    storeInfo: {
      type: Object,
      value: {}
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    imgUrl: null // app.globalData.siteinfo.imgUrl
  },

  /**
   * 组件的方法列表
   */
  methods: {
    readyOne() { //首次准备
      try {
        wx.getFileSystemManager().rmdirSync(true, `${wx.env.USER_DATA_PATH}/qrcode`);
      } catch (e) {};

      // 兼容旧版缓存
      let posterStorage = wx.getStorageSync('poster');
      if (posterStorage && posterStorage.constructor.name != "Object") {
        wx.removeStorageSync('poster')
      }
      this.shareGroup = JSON.parse(wx.getStorageSync('shareInfo').shareGroup); //不能直接使用的海报数据
      // this.setData({
      //   imgUrl: app.globalData.siteinfo.imgUrl,
      //   swichShow: this.posterRaw.length > 1 ? true : false //切换按钮是否显示
      // })
      // this.posterRaw = [{
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

      this.dealStore(() => { //店铺区分
        this.setData({
          imgUrl: app.globalData.siteinfo.imgUrl,
          swichShow: this.posterRaw.length > 1 ? true : false //切换按钮是否显示
        })
        this.type = 0;
        this.readyImg(); //区分处理完开始首次准备材料
      });
    },
    //店铺区分
    dealStore(cb) {
      if (this.data.storeType == 'join') { //邀请入驻
        this.shareGroup.constructor.name == "Array" ? (this.posterRaw = this.shareGroup) : (this.posterRaw = this.shareGroup.invite.poster);
        let myGroupStore = wx.getStorageSync('myGroupStore');
        this.setData({
          avatar: myGroupStore.logo,
          name: myGroupStore.name + '邀您入驻',
          phone: myGroupStore.storeMobile || '',
          sign: myGroupStore.signature || ''
        })
      } else if (this.data.storeType == 'groupStore') { //团购店铺分享
        this.shareGroup.constructor.name == "Array" ? (this.posterRaw = this.shareGroup) : (this.posterRaw = this.shareGroup.group.poster);
        let myIsGroup = wx.getStorageSync('myIsGroup');
        if (this.data.storeInfo && !Service.isEmptyObj(this.data.storeInfo)) { //分享人的店铺
          this.setData({
            avatar: this.data.storeInfo.logo.startsWith('http') ? this.data.storeInfo.logo : (this.data.storeInfo.logo ? this.data.imgUrl + this.data.storeInfo.logo : ''),
            name: this.data.storeInfo.name + '的团购小店',
            phone: this.data.storeInfo.phone,
            sign: this.data.storeInfo.signature
          })
        } else if (myIsGroup == '1') { //我有团购店铺
          let myGroupStore = wx.getStorageSync('myGroupStore');
          this.setData({
            avatar: myGroupStore.logo,
            name: myGroupStore.name + '的团购小店',
            phone: myGroupStore.storeMobile || '',
            sign: myGroupStore.signature || ''
          })
        } else if (app.globalData.groupStoreInfo) {
          let groupStoreInfo = app.globalData.groupStoreInfo;
          this.setData({
            avatar: groupStoreInfo.logo,
            name: groupStoreInfo.name + '的团购小店',
            phone: groupStoreInfo.storeMobile || '',
            sign: groupStoreInfo.signature
          })
        } else {
          this.setData({
            avatar: app.globalData.userInfo.avatarUrl,
            name: app.globalData.AppName + '的团购小店',
          })
        }
      } else { //普通店铺分享
        this.shareGroup.constructor.name == "Array" ? (this.posterRaw = this.shareGroup) : (this.posterRaw = this.shareGroup.store.poster);
        let myIsStore = wx.getStorageSync('myIsStore');
        if (this.data.storeInfo && !Service.isEmptyObj(this.data.storeInfo)) { //分享人的店铺
          this.setData({
            avatar: this.data.storeInfo.logo.startsWith('http') ? this.data.storeInfo.logo : (this.data.storeInfo.logo ? this.data.imgUrl + this.data.storeInfo.logo : ''),
            name: this.data.storeInfo.name + '的小店',
            phone: this.data.storeInfo.phone,
            sign: this.data.storeInfo.signature,
            showStore: true //绘制的店铺二维码
          })
        } else if (myIsStore == '1') { //我有店铺
          let myStore = wx.getStorageSync('myStore');
          this.setData({
            avatar: myStore.logo.startsWith('http') ? myStore.logo : (myStore.logo ? this.data.imgUrl + myStore.logo : ''),
            name: myStore.name + '的小店',
            phone: myStore.storeMobile,
            sign: myStore.signature,
            showStore: true //绘制的店铺二维码
          })
        } else if (app.globalData.storeInfo) { //进的别人店铺
          let storeInfo = app.globalData.storeInfo;
          this.setData({
            avatar: storeInfo.logo.startsWith('http') ? storeInfo.logo : (storeInfo.logo ? this.data.imgUrl + storeInfo.logo : ''),
            name: storeInfo.name + '的小店',
            phone: storeInfo.storeMobile,
            sign: storeInfo.signature,
            showStore: true //绘制的店铺二维码
          })
        } else {
          this.setData({
            avatar: app.globalData.userInfo.avatarUrl,
            name: app.globalData.AppName + '的小店',
            showStore: false //绘制的不是店铺二维码
          })
        }
      }
      cb && cb();
    },

    swichPoster(e) {
      this.type++;
      this.type >= this.posterRaw.length && (this.type = 0);
      this.readyImg();
    },

    readyImg() { //准备图片材料
      let idx = this.type;
      wx.showLoading({
        title: '绘制中',
      })

      let promiseArr = []; //Promise 数组

      /**下载背景图片 */
      this.posterArr || (this.posterArr = []);
      if (!this.posterArr[idx]) {
        let p1 = new Promise((resolve, reject) => { //下载背景图片
          let posterStorage = wx.getStorageSync('poster');
          // if (posterStorage && posterStorage[this.data.storeType] && posterStorage[this.data.storeType][idx] && posterStorage[this.data.storeType][idx].src) { //图片缓存优化
          //   this.posterArr[idx] = {
          //     src: posterStorage[this.data.storeType][idx].src
          //   }
          //   resolve();
          // }
          let src = this.posterRaw[idx].src;
          if (src.startsWith('http') || !src.startsWith('/images')) { //远程图片
            src = src.startsWith('http') ? src : (this.data.imgUrl + src);
            wx.downloadFile({
              url: src,
              success: res => {
                this.posterArr[idx] = {
                  src: res.tempFilePath
                }
                resolve();
                // posterStorage || (posterStorage = {});
                // posterStorage[this.data.storeType] || (posterStorage[this.data.storeType] = []);
                // posterStorage[this.data.storeType][idx] = {
                //   src: res.tempFilePath
                // }
                // wx.setStorageSync('poster', posterStorage);
              },
              fail: err => {
                reject("下载图片失败")
                
              }
            });
          } else { //本地图片
            this.posterArr.push({
              src: src
            })
            resolve();
          }
        })
        promiseArr.push(p1);
      }

      /**小程序码 */
      if (!this.qrcode) {
        let p2 = this.req();
        p2.then(res => {
          let myEventDetail = { // detail对象，提供给事件监听函数
            qrcode: this.qrcode
          };
          let myEventOption = {}; // 触发事件的选项
          this.triggerEvent('qrcode', myEventDetail, myEventOption);
        })
        promiseArr.push(p2);
      }

      /**下载头像 */
      if (!this.avatar && this.data.avatar) { //店铺分享 下载头像
        let p3 = new Promise((resolve, reject) => { //下载头像
          wx.downloadFile({
            url: this.data.avatar,
            success: res => {
              this.avatar = res.tempFilePath;
              resolve();
            },
            fail: err => {
              reject(err)
            }
          });
        })
        promiseArr.push(p3);
      }
      Promise.all(promiseArr).then(() => {
        this.drawCvs();
      }).catch(err => {
        console.error(err);
        this.closeTap();
        wx.showToast({
          title: err,
          icon: 'none',
          duration: 3000
        })
      })
    },

    // 获取二维码
    req() {
      return new Promise((resolve, reject) => {
        let fuid, page;
        if (this.data.storeType == "join") { //邀请入驻
          fuid = wx.getStorageSync('uid');
          page = "pages/apply_regimental/apply_regimental";
        } else if (this.data.storeType == "groupStore") { //团购
          let myIsGroup = wx.getStorageSync('myIsGroup');
          let myuid = wx.getStorageSync('uid');
          fuid = (myIsGroup == '1') ? myuid : (app.globalData.groupStoreInfo ? app.globalData.groupStoreInfo.userId : '');
          page = "pages/tg_store/tg_store";
        } else { //普通分享 店铺分享
          let myIsStore = wx.getStorageSync('myIsStore');
          let myuid = wx.getStorageSync('uid');
          fuid = (this.data.storeInfo && !Service.isEmptyObj(this.data.storeInfo)) ? this.data.storeInfo.userId : ((myIsStore == '1') ? myuid : (app.globalData.storeInfo ? app.globalData.storeInfo.userId : ''));
          page = this.showStore ? "pages/my_store/my_store" : "pages/index/index";
        }

        let uid = fuid ? STRSHORT.Compress(fuid) : "ABC";
        console.log(uid);
        WXRQ.getQrcode({
          scene: `${uid}`,
          page: page,
          isHyaline: true,
          enable: false
        }, res => {
          // let base64Str = wx.arrayBufferToBase64(res.data.data); //对数据进行转换操作
          let FileSystemManager = wx.getFileSystemManager();
          let filePath = `${wx.env.USER_DATA_PATH}/qrcode`;
          try {
            FileSystemManager.mkdirSync(filePath); //創建目錄
          } catch (e) {};
          let str = Math.random().toString(36).slice(4) + Date.now();
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
                  reject("小程序码有误")
                }
              })
            },
            fail: err => {
              reject("小程序码有误")
            }
          })
        }, err => {
          reject('请求失败')
        })
      })
    },

    drawCvs() { //画
      const ctx = wx.createCanvasContext('storeCvs', this);
      ctx.beginPath();
      ctx.clearRect(0, 0, 780, 1200);
      ctx.drawImage(this.posterArr[this.type].src, 0, 0, 780, 1200); //背景图片 

      ctx.arc(390, 975, 84, 0, 2 * Math.PI);
      ctx.setFillStyle('#fff');
      ctx.fill();
      this.qrcode && ctx.drawImage(this.qrcode, 315, 900, 150, 150); //二维码

      ctx.fillStyle = this.posterRaw[this.type].fontColor || "#000";
      ctx.font = '40px sans-serif';
      ctx.setTextAlign('center');
      this.posterRaw[this.type].title && ctx.fillText(this.posterRaw[this.type].title, 390, 760);
      ctx.font = '33px sans-serif';
      this.posterRaw[this.type].subtitle && ctx.fillText(this.posterRaw[this.type].subtitle, 390, 850);
      this.posterRaw[this.type].footerText && ctx.fillText(this.posterRaw[this.type].footerText, 390, 1130);


      ctx.fillStyle = this.posterRaw[this.type].color || "#000";
      ctx.font = '33px sans-serif';
      ctx.setTextAlign('center');
      this.data.name && ctx.fillText(`${this.data.name}`, 390, 405);
      this.data.phone && ctx.fillText(this.data.phone, 390, 450);

      if (this.data.sign) {
        let y = Math.ceil(this.data.sign.length / 20);
        for (let i = 0; i < y; i++) {
          ctx.fillText(this.data.sign.slice(i * 20, (i + 1) * 20), 390, 495 + i * 45);
        }
      }

      // const grd = ctx.createCircularGradient(390, 261, 180);
      // grd.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
      // grd.addColorStop(1, 'rgba(255, 255, 255, 0)');
      // ctx.setFillStyle(grd);
      // ctx.fillRect(198, 69, 384, 384);

      ctx.save();
      ctx.beginPath();
      this.clearArcFun(390, 261, 87, ctx);


      ctx.arc(390, 261, 81, 0, 2 * Math.PI);
      ctx.clip();
      ctx.drawImage(this.avatar, 309, 180, 162, 162); //小主的店头像
      ctx.restore();


      ctx.draw(true, res => {
        this.timout_1 = setTimeout(() => {
          clearTimeout(this.timout_1);
          this.getCVS();
        }, 500)
      });
    },

    getCVS() { //生成临时路径
      wx.canvasToTempFilePath({
        fileType: 'png',
        canvasId: 'storeCvs',
        success: (res) => {
          wx.hideLoading();
          this.setData({
            tempFilePath: res.tempFilePath
          })
          let myEventDetail = { // detail对象，提供给事件监听函数
            tempFilePath: res.tempFilePath
          };
          let myEventOption = {}; // 触发事件的选项
          this.triggerEvent('cvs', myEventDetail, myEventOption);
        },
        fail: err => {
          console.error(err)
        }
      }, this)
    },
    //保存
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
                tableShow: false,
                tempFilePath: ''
              })
              this.qrcode = null;
              this.avatar = null;

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
    // 关闭按钮
    closeTap(e) {
      wx.hideLoading();
      this.setData({
        tableShow: false,
        tempFilePath: ''
      })
      this.qrcode = null;
      this.avatar = null;

      let myEventDetail = {}; // detail对象，提供给事件监听函数
      let myEventOption = {}; // 触发事件的选项
      this.triggerEvent('close', myEventDetail, myEventOption);
    },

    /**
     * 检查相册授权情况  onshow 触发
     */
    checkPhotosAlbum() {
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
    prevImg() {
      if (this.data.tempFilePath) {
        wx.previewImage({
          urls: [this.data.tempFilePath],
        })
      }
    },

    /**
     * canvas绘图相关
     * (x,y)为要清除的圆的圆心，r为半径，cxt为context
     *  用clearRect方法清除canvas上不能用clip剪切的圆形
     */
    clearArcFun(x, y, r, ctx) {
      ctx.fillStyle = "#fff";
      let stepClear = 0.1; //这是定义精度 
      clearArc(x, y, r);

      function clearArc(x, y, radius) {
        let calcWidth = radius - stepClear;
        let calcHeight = Math.sqrt(radius * radius - calcWidth * calcWidth);
        let posX = x - calcWidth;
        let posY = y - calcHeight;
        let widthX = 2 * calcWidth;
        let heightY = 2 * calcHeight;
        if (stepClear <= radius) {
          ctx.fillRect(posX, posY, widthX, heightY); //画一个圆形区域
          stepClear += 0.1;
          clearArc(x, y, radius);
        }
      }
    }
  }
})