import Common from './common.js';
import Siteinfo from '../siteinfo.js';
export default {
  /**开始倒计时 
   * 参数列表
   * thisObj : 页面的Page
   * endDate : 结束时间（毫秒）数组，可接受多个；
   * type : 倒计时单位 day , hour , minute ,second ；
   * finished() :倒计时结束的回调
   */
  startCountDate(options) {
    if (!options.endDate) {
      console.error('参数endDate不能为空');
      return false;
    }
    if (!options.thisObj) {
      console.error('参数this不能为空');
      return false;
    }
    let dt = [],
      now = Date.now();
    for (let i = 0; i < options.endDate.length; i++) {
      dt.push(options.endDate[i] - now)
    }
    let type;
    switch (options.type) {
      case "day":
        type = 86400000;
        break;
      case "hour":
        type = 3600000;
        break;
      case "minute":
        type = 60000;
        break;
      case "second":
        type = 1000;
        break;
      default:
        type = 1000;
        break;
    }

    function CutDown(dt, type) {
      this.dt = dt;
      this.type = type;
    }
    CutDown.prototype = {
      constructor: CutDown,
      startCutDown() {
        this._turnFn(this.dt);
      },
      _turnFn(dt) {
        let arr = [];
        for (let i = 0; i < dt.length; i++) {
          if (dt[i] <= 0) {
            arr.push({
              day: 0,
              hour: 0,
              minute: 0,
              second: 0
            })
            continue;
          };
          let day, hour, minute, second;
          day = Math.floor(dt[i] / 86400000);
          this.type <= 3600000 && (hour = Math.floor((dt[i] % 86400000) / 3600000));
          this.type <= 60000 && (minute = Math.floor((dt[i] % 3600000) / 60000));
          this.type <= 1000 && (second = Math.floor((dt[i] % 60000) / 1000));
          arr.push({
            day: day,
            hour: hour < 10 ? '0' + hour : hour,
            minute: minute < 10 ? '0' + minute : minute,
            second: second < 10 ? '0' + second : second
          })
          day = null; //释放内存
          hour = null;
          minute = null;
          second = null;
        }
        this.timout = setTimeout(() => {
          clearTimeout(this.timout);
          this.noend = false; //假设即将结束倒计时
          for (let i = 0; i < dt.length; i++) {
            if (dt[i] > 0) {
              dt[i] -= this.type;
              this.noend = true;
            } else {
              dt[i] = 0;
            }
          }
          if (!this.noend) {
            options.finished && options.finished(); //倒计时结束回调
            return false; //假设成立，结束倒计时
          }
          this._turnFn(dt);
        }, this.type)
        options.thisObj.setData({
          countDown: arr
        })
        arr = null; //释放内存
      },
      endCutDown() {
        clearTimeout(this.timout);
      }
    }
    this.cutDown = new CutDown(dt, type);
    this.cutDown.startCutDown();
    now = null; //释放内存
    dt = null;
    type = null;
  },
  /**结束倒计时 */
  endCountDate() {
    if (this.cutDown) {
      this.cutDown.endCutDown();
      this.cutDown = null;
    }
  },
  /**
   * data:传输数据
   * url:接口
   * success:成功回调
   * fail:失败回调
   */
  payMoney(options) {
    Common.request({
      url: options.url,
      method: 'POST',
      data: options.data,
      success: res => {
        let orderId = res.data.data.orderId || null;
        let moneyPaid = res.data.data.moneyPaid || null;
        if (res.data.data) {
          if (res.data.data.signType) {
            wx.requestPayment({
              'timeStamp': res.data.data.timeStamp,
              'nonceStr': res.data.data.nonceStr,
              'package': res.data.data.package,
              'signType': res.data.data.signType,
              'paySign': res.data.data.paySign,
              'success': wxpayRes => {
                orderId && (wxpayRes.orderId = orderId);
                moneyPaid && (wxpayRes.moneyPaid = moneyPaid);
                wxpayRes.paySign = res.data.data.paySign;
                options.success && options.success(wxpayRes);
              },
              'fail': res => {
                let errorMsg = res.errorMsg || res.errMsg || res.msg || res.message;
                if (errorMsg.indexOf('cancel') > 0) {
                  wx.showModal({
                    content: '支付已取消',
                    showCancel: false
                  });
                } else {
                  wx.showModal({
                    content: errorMsg,
                    showCancel: false
                  });
                }
                options.fail && options.fail({
                  orderId: orderId
                });
              }
            })
          } else {
            options.success && options.success({
              orderId: orderId
            });
          }
        }
      },
      fail: err => {
        options.fail && options.fail(err)
      }
    })
  },
  shareObj() {
    let shareInfo = wx.getStorageSync('shareInfo');
    let myIsStore = wx.getStorageSync('myIsStore');
    let app = getApp();
    let imgUrl = app.globalData.siteinfo.imgUrl;
    if (myIsStore == '1') { //如果我有小店
      console.log(777)
      let myStore = wx.getStorageSync('myStore');
      let title = this.convertText(shareInfo.shareTitle, myStore.name)
      return {
        title: title,
        imageUrl: shareInfo.sharePic ? (imgUrl + shareInfo.sharePic) : "",
        path: `/pages/my_store/my_store?fuid=${wx.getStorageSync('uid')}`
      }
    } else if (app.globalData.storeInfo) { // 进入了别人的小店
      let title = this.convertText(shareInfo.shareTitle, app.globalData.storeInfo.name)
      return {
        title: title,
        imageUrl: shareInfo.sharePic ? (imgUrl + shareInfo.sharePic) : "",
        path: `/pages/my_store/my_store?fuid=${app.globalData.storeInfo.userId}`
      }
    }
    let title = this.convertText(shareInfo.shareTitle, app.globalData.AppName)
    return {
      title: title,
      imageUrl: shareInfo.sharePic ? (imgUrl + shareInfo.sharePic) : "",
      path: `/pages/index/index?fuid=${wx.getStorageSync('uid')}`
    }
  },
  //缓存海报图片
  downLoadPoster(srcJson) {
    let srcObj = JSON.parse(srcJson);
    let len = Object.keys(srcObj).length;
    let keyStr = ['first', 'second'];
    let prr = [];
    for (let i = 0; i < len; i++) {
      prr.push(this.dowloadFn(Siteinfo.imgUrl + srcObj[keyStr[i]]))
    }
    Promise.all(prr).then(res => {
      wx.setStorageSync('poster', res);
      this.posterCb && this.posterCb();
    }).catch(err => {
      console.error(err)
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
  //判断空对象
  isEmptyObj(obj) {
    for (var key in obj) {
      return false
    };
    return true
  },
  /**分享昵称文本转换 */
  convertText(str, newstr) {
    return str.replace(/#.*?#/g, newstr);
  },
}