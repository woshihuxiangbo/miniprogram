/**

 */
import Siteinfo from '../siteinfo.js';
import WXRQ from './wxrq.js';
import Base64 from './base64.js';

export default {
  /**
   * 请求
   * options参数说明：
   * url :接口
   * data ：数据
   * method ："POST" 或 "GET"
   * type : go后台 则填写“go”
   * withToken :是否带token  true 或 false
   * showLoading :是否展示loading
   * success :成功回调
   * fail :失败回调
   *  */
  request(options) {
    let url = `${Siteinfo.domain}/${Siteinfo.subDomain && (Siteinfo.subDomain + '/')}${Siteinfo.apiVersion && (Siteinfo.apiVersion + '/')}${options.url}`,
      token;
    if (options.withToken == undefined || options.withToken) {
      token = wx.getStorageSync('token');
    }
    if (options.showLoading) {
      wx.showLoading({
        title: '加载中'
      });
    }
    if (options.type == 'go') {
      if (options.data) {
        options.data.storeId = Siteinfo.subDomain;
      } else {
        options.data = {
          storeId: Siteinfo.subDomain
        };
      }
    }
    if (options.data && (options.data).constructor.name == 'String') {
      options.data = JSON.stringify(options.data);
    }
    wx.request({
      url: url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'x-user-token': token || ''
      },
      success: res => {
        options.showLoading && wx.hideLoading();
        if (res.data.code * 1 == 200) { //成功
          !options.is_login && (this.agained = null); //如果记录过重新登录，则成功后清除
          options.showLoading && wx.hideLoading();
          options.success && options.success(res);
        } else if (res.data.code * 1 == 401) { //认证失败  重新登录
          if (this.agained || options.is_login) {
            // wx.showToast({
            //   title: '网络连接失败，请稍后再试',
            //   icon: 'none'
            // })
            return;
          }
          this.goLogin(() => {
            this.agained = true; //记录重新登录过,如果依然报错，则说明不是登录问题，不再重新登录
            this.request(options);
          });
        } else if (res.data.code * 1 == 400) { //弹出错误提示  huo 内部错误（手机号解密失败，请弹400）
          if (res.data.msg) {
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            });
          }
          options.fail && options.fail(res);
        } else {
          // wx.showToast({
          //   title: '网络连接失败，请稍后再试',
          //   icon: 'none'
          // })
          options.fail && options.fail(res);
        }
      },
      fail: err => {
        // wx.showToast({
        //   title: '网络连接失败，请稍后再试',
        //   icon: 'none'
        // })
        options.showLoading && wx.hideLoading();
        options.fail && options.fail(err);
      }
    });
  },

  //检查登录
  checkLogin(cb) {
    let token = wx.getStorageSync('token');
    if (token) {
      let baseData = Base64.decode(token.split('.')[1]);
      let tokenInfo = {};
      try {
        tokenInfo = JSON.parse(baseData);
      } catch (e) {
        tokenInfo.exp = new Date().getTime() / 1000;
        wx.removeStorageSync('token');
      }
      if (tokenInfo.exp * 1000 <= Date.now()) {
        this.goLogin(res => { //登录
          this.checkMyStore(() => { //检查自己有没有店铺
            getApp().loadFinish = true;
            cb && cb();
          }, true);
        });
      } else {
        this.updateUserInfo().then(res => { //获取最新头像昵称
          getApp().globalData.userInfo = res.userInfo;
          this.checkMyStore(() => { //检查自己有没有店铺
            getApp().loadFinish = true;
            cb && cb();
          }, true);
        }).catch(err => {});
      }
    } else {
      this.goLogin(res => { //登录
        this.checkMyStore(() => { //检查自己有没有店铺
          getApp().loadFinish = true;
          cb && cb();
        }, true);
      });
    }
  },
  // 登录
  goLogin(cb) {
    Promise.all([this.login(), this.updateUserInfo()]).then(res => {
      let data = {};
      if (res[1].userInfo) {
        getApp().globalData.userInfo = res.userInfo;
        data.nickname = res[1].userInfo.nickName;
        data.avatar = res[1].userInfo.avatarUrl;
      }
      data.code = res[0].code;
      WXRQ.login(data).then(res => {
        if (res.data.data && res.data.data.token) {
          wx.setStorageSync('token', res.data.data.token);
          wx.setStorageSync('uid', res.data.data.id);
          res.data.data.nickname && wx.setStorageSync('authorize', true);
        }
        cb && cb(res);
      }).catch(err => {
        console.error(err);
      });
    }).catch(err => {
      console.error(err);
    });
  },
  //登录获取code
  login(cb) {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          resolve(res);
        }
      });
    });
  },
  //登录更新授权信息
  updateUserInfo() {
    return new Promise((resolve, reject) => {
      wx.getUserInfo({
        success: res => {
          wx.setStorageSync('authorize', true);
          resolve(res);
        },
        fail: err => {
          resolve(err);
        }
      });
    });
  },

  //获取授权信息
  getUserInfo(detail, cb) {
    if (detail.errMsg == 'getUserInfo:ok') {
      wx.setStorageSync('authorize', true);
      getApp().globalData.userInfo = detail.userInfo;
      WXRQ.saveUserInfo({
        header: detail.userInfo.avatarUrl,
        nickname: detail.userInfo.nickName,
        encryptedData: detail.encryptedData,
        iv: detail.iv
      }).then(res => {
        cb && cb();
      }).catch(err => {
        cb && cb();
        console.error(err);
      });
    } else {
      wx.showModal({
        title: '温馨提示',
        content: '请允许授权，以便我们为您提供更好的服务'
      });
    }
  },


  // 检查授权  进入app页面请调该方法
  checkLoadFinsh(cb) {
    let app = getApp();
    if (app.appLoad) {
      cb && cb();
    } else {
      app.appLoadCb = () => {
        cb && cb();
      };
    }
  },


  //授权手机号
  getPhoneNumber(detail, cb) {
    if (detail.errMsg == 'getPhoneNumber:ok') {
      WXRQ.postPhoneNumber(detail).then(res => {
        cb && cb(res);
      }).catch(err => {
        this.goLogin(() => {
          wx.showToast({
            title: '获取手机号失败，请重新授权',
            icon: 'none'
          });
        });
      });
    }
  },
  //检查自己有没有店铺
  checkMyStore(cb, visit) { //检查自己有没有店铺
    WXRQ.isUserstore({
      userIds: wx.getStorageSync('uid')
    }).then((res) => {
      if (res.data && res.data.data) {
        if (res.data.data.flg == false) {
          wx.setStorageSync('myIsStore', '0'); //自己没有店铺
          cb && cb();
          this.getOtherStore(() => {}, visit); //获取上级
        } else {
          wx.setStorageSync('myIsStore', '1'); //自己有店铺 当前店铺是自己的
          let app = getApp();
          app.globalData.storeInfo = null;
          app.globalData.fuid = null;
          cb && cb(res.data.data);
          wx.setStorageSync('myStore', res.data.data);
        }
      } else {
        cb && cb();
      }
    }).catch(err => {
      cb && cb();
      console.error(err);
    });
  },

  //获取别人的店铺信息，（优先上级，其次是userId）,否则是空
  getOtherStore(cb, visit) {
    let app = getApp();
    if (app.globalData.fuid) {
      WXRQ.getSubById({
        userIds: app.globalData.fuid
      }).then((res) => {
        if (res.data.data) {
          app.globalData.storeInfo = res.data.data;
          app.globalData.fuid = res.data.data.userId;
          if (visit) {

            WXRQ.browse({ //刷浏览量
              userId: app.globalData.fuid
            }).then(res => {}).catch(err => {
              console.error(err);
            });
          }

        }
        cb && cb();
      }).catch(err => {
        console.error(err);
      });
    } else {
      WXRQ.getSubById().then((res) => {
        if (res.data.data) {
          app.globalData.storeInfo = res.data.data;
          app.globalData.fuid = res.data.data.userId;

          if (visit) {
            WXRQ.browse({ //刷浏览量
              userId: app.globalData.fuid
            }).then(res => {}).catch(err => {
              console.error(err);
            });
          }
        }
        cb && cb();
      }).catch(err => {
        console.error(err);
      });
    }
  }
};