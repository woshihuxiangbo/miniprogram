//app.js
import CommonService from './utils/common.js';
import Setting from './utils/app.setting.js';

let STRSHORT = require('/utils/strShort.js');
import WXRQ from './utils/wxrq.js';
import Siteinfo from './siteinfo.js';
import Service from './utils/service.js';
import GlobalConfig from './config/index'

const globalConfig = new GlobalConfig()
globalConfig.init()
const ShareScence = [1007, 1008, 1011, 1012, 1013, 1025, 1031, 1032, 1036, 1044, 1045, 1046, 1047, 1048, 1049, 1084, 1096];
App({
  onLaunch: function(options) {
    let siteInfo = wx.getStorageSync('siteinfo');
    let extInfo = wx.getExtConfigSync();
    if (!Service.isEmptyObj(extInfo)) {
      this.globalData.siteinfo = Object.assign(Siteinfo, extInfo);
      this.startUp();
    } else if (siteInfo) {
      siteInfo.domain && delete siteInfo.domain;
      this.globalData.siteinfo = Object.assign(Siteinfo, siteInfo);
      this.startUp();
      this.appSetting();
    } else {
      this.appSetting(() => {
        this.startUp();
      });
    }
    this.globalData.phoneInfo = wx.getSystemInfoSync();
    this.checkUpdateManager();
  },
  appSetting(cb) {
    let appId = wx.getAccountInfoSync().miniProgram.appId;
    if (appId === 'wx732b474919af6a9a' && !Siteinfo.dev) {
      this.globalData.siteinfo = Object.assign(Siteinfo, {
        domain: 'https://api.chuangxiaozhu.com/api', //创小主正式
        subDomain: "1", //店铺id     
        apiVersion: "v1",
        imgUrl: "https://img.chuangxiaozhu.com/", //创小主正式
        mgtUrl: 'http://m.mgt.chuangxiaozhu.com/',
      });
      cb && cb();
      return;
    }
    WXRQ.getStoreId({
      appId
    }, res => {
      this.globalData.siteinfo = Siteinfo;
      cb && cb();
    });
  },
  startUp() {
    this.getConfig(); //app配置信息
    try {
      CommonService.checkLogin(res => { //登錄 确认头像昵称  确认店铺归属人
        this.appLoad = true;
        this.appLoadCb && this.appLoadCb();
      });
    } catch (e) {
      console.error(e);
    }
    this.getShare();
    this.getPoster();
  },
  onShow: function(options) {
    console.log('app onShow', options);
    let isShare = ShareScence.indexOf(options.scene);
    if (isShare == -1) { //官方通道进入  不指定页面
      this.globalData.official = true;

      if (this.globalData.fuid) {
        console.log('有fuid');
        this.globalData.fuid = '';
        if (this.loadFinish && wx.getStorageSync('myIsStore') == '0') { //在线更新店铺
          this.globalData.storeInfo = null;
          CommonService.getOtherStore(cb => {}, true);
        }
      }
      return;
    }
    this.globalData.official = null;

    if (options.query.type == 'group' || options.query.eventType == 3) return;
    if (options.query.fuid) { //分享通道进入
      this.globalData.fuid = options.query.fuid;
      if (this.loadFinish && wx.getStorageSync('myIsStore') == '0') { //在线更新店铺
        this.globalData.storeInfo = null;
        CommonService.getOtherStore(cb => {}, true);
      }
    } else if (options.query.scene) { //分享海报进入
      let arr = decodeURIComponent(options.query.scene).split(',');
      let fuid = STRSHORT.Decompress(arr[0]);
      if (fuid.length >= 19 && /\d{19}/.test(fuid)) {
        this.globalData.fuid = fuid;
        if (this.loadFinish && wx.getStorageSync('myIsStore') == '0') { //在线更新店铺
          this.globalData.storeInfo = null;
          CommonService.getOtherStore(cb => {}, true);
        }
      }
    }
    this.appShowCb && this.appShowCb();
    console.log('app globalData下的fuid', this.globalData.fuid);
  },
  globalData: {
    config: globalConfig,
    /**店铺信息 */
    fuid: '',
    storeInfo: null,
    groupStoreInfo: null,
    userInfo: null, //用户信息
    settings: null, //授权状态
    location: null, //定位信息
    phoneInfo: null, //手机设备信息
    siteinfo: Siteinfo,
    AppName: '',
    shortName: '',
    subDomain: '1',
    lvConfig: {},
    storeLogo: '',
    hiddenAudit: '',
    posterTxt: null //海报文字勿动
  },

  checkUpdateManager() { //app更新
    let updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(res => {
      if (res.hasUpdate) {
        updateManager.onUpdateReady(res => {
          wx.showModal({
            title: '更新提示',
            content: '已有新版本，点击更新',
            success: res => {
              updateManager.applyUpdate();
            }
          });
        });
      }
    });
  },
  getConfig(cb) {
    wx.request({
      url: `${this.globalData.siteinfo.domain}/item/u/store/get?id=${this.globalData.siteinfo.subDomain}&column=lvConfig,name,storeLogo,shortName`,
      success: res => {
        if (res.data.data) {
          let lvConfig = JSON.parse(res.data.data.lvConfig);
          this.globalData.lvConfig = lvConfig;
          this.globalData.AppName = res.data.data.name;
          this.globalData.shortName = res.data.data.shortName;
          this.globalData.storeLogo = res.data.data.storeLogo;
          this.globalData.hiddenAudit = res.data.data.hiddenAudit;
          wx.setStorageSync('lvConfig', lvConfig);
          this.configInit = true;
          this.configCb && this.configCb();
          cb && cb(res);
        }
      }
    })
  },
  getShare() { //获取分享信息
    WXRQ.getShareInfo().then((res) => {
      wx.setStorageSync('shareInfo', res.data.data);
    }).catch(err => {
      console.error(err);
    });
  },
  //区分海报信息
  getPoster() {
    let appStoreId = this.globalData.siteinfo.subDomain;
    switch (appStoreId) {
      case '1':
        this.globalData.posterTxt = { //创小主
          str_1: '创小主',
          str_2: 'CREATE YOUNG MISTRESS',
          str_3: 'CHUANG XIAO ZHU',
          str_4: '创业就上创小主',
          str_5: '让 天 下 女 性 财 貌 兼 得',
          str_6: '赋能小主轻创业',
          color: '#DF625C',
          background: '#E5817D'
        };
        break;
      case '1110119584934920192':
        this.globalData.posterTxt = { //佩云
          str_1: '',
          str_2: '',
          str_3: '',
          str_4: '社交新零售轻创业平台',
          str_5: '让 天 下 女 性 财 貌 兼 得',
          str_6: '口袋里的美妆小店',
          color: '#EFC963',
          background: '#F2D481'
        };
        break;
      case '1111532076860964864':
        this.globalData.posterTxt = { //伊妍夜色
          str_1: '',
          str_2: '',
          str_3: '',
          str_4: '社交新零售轻创业平台',
          str_5: '让 天 下 女 性 财 貌 兼 得',
          str_6: '口袋里的美妆小店',
          color: '#FB99A9',
          background: '#FBACBA'
        };
        break;
      case '1110778466518695936':
        this.globalData.posterTxt = { //开美
          str_1: '',
          str_2: '',
          str_3: '',
          str_4: '社交新零售轻创业平台',
          str_5: '让 天 下 女 性 财 貌 兼 得',
          str_6: '口袋里的美妆小店',
          color: '#8585DB',
          background: '#9C9CE2'
        };
        break;
      default:
        this.globalData.posterTxt = { //开美
          str_1: '',
          str_2: '',
          str_3: '',
          str_4: '社交新零售轻创业平台',
          str_5: '让 天 下 女 性 财 貌 兼 得',
          str_6: '口袋里的美妆小店',
          color: '#8585DB',
          background: '#9C9CE2'
        };
        break;
    }
  }

});