// pages/seckill_detail/seckill_detail.js
import Service from '../../utils/service.js';
import WXRQ from '../../utils/wxrq.js';
import PreOrder from '../../model/preOrder.js';
import CommonService from '../../utils/common.js';

const WxParse = require('../../wxParse/wxParse.js');
let STRSHORT = require('../../utils/strShort.js');
let app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    appStoreId: '',
    ossUrl: '',
    tableShow: false,
    is_collect: false,
    goods: null,
    horn: null,
    attribute: null,
    // detail: null,
    commentList: null,
    store: null,
    currentAttr: null, //选中的属性
    group: [{}, {}, {}, {}],
    swipauto: true,
    modalHidden: true,
    isShow: '2'
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    // wx.hideShareMenu();
    // 判断是否为免费领礼品
    if (options.isShow) {
      this.setData({
        isShow: options.isShow
      });
    }
    if (options.goodsId) { //页面内部跳转
      options.goodsId != 'undefined' && (this.goodsId = options.goodsId);
      options.fuid && (this.fuid = options.fuid);
      this.setData({
        eventType: options.eventType || 1,
        appStoreId: app.globalData.siteinfo.subDomain,
        ossUrl: app.globalData.siteinfo.imgUrl,
        posterBtn: true
      });
      if (options.eventType == 3) { //社区拼团
        this.getGroup(options.skuId, options.eventType);
        this.getGroupGoodsDetail(options.skuId);
      } else {
        this.getGoodsDetail(options.skuId);
      }
      this.getGoodsDetailHorn();
      this.goodsId && this.getGoodsComment();
      this.getStore();
      this.checkCollect(options.skuId, options.eventType);
    } else { //分享进来
      CommonService.checkLoadFinsh(() => {
        console.log('分享', options);
        this.setData({
          appStoreId: app.globalData.siteinfo.subDomain,
          ossUrl: app.globalData.siteinfo.imgUrl,
          modalHidden: wx.getStorageSync('authorize') || false,
          posterBtn: true
        });
        if (options.scene && options.scene != 'undefined') { //二维码进入
          let scene = decodeURIComponent(options.scene);
          if (scene.indexOf('=') < 0) { //自己的码
            let arr = scene.split(',');
            this.fuid = STRSHORT.Decompress(arr[0]);
            this.shareGoods(STRSHORT.Decompress(arr[1]), arr[2]); //skuid eventType
          } else { //后台的码
            let arr = scene.split('&');
            let pramer = {};
            for (let i = 0; i < arr.length; i++) {
              let value = arr[i].split('=');
              pramer[value[0]] = value[1];
            }
            this.shareGoods(pramer.skuId, 1); //skuid eventType
          }
        } else { //分享链接进入
          this.fuid = options.fuid;
          this.shareGoods(options.skuId, options.eventType || 1);
        }
      });
    }
  },
  userInfoSuc() {
    this.setData({
      modalHidden: true
    });
  },
  // 分享商品进来处理
  shareGoods(skuid, eventType) {
    this.setData({
      eventType: eventType
    });
    if (eventType == 3) { //社区拼团
      this.getGroup(skuid, eventType);
      this.getGroupGoodsDetail(skuid, res => {
        this.goodsId = res;
        this.getGoodsComment();
      });
    } else {
      this.getGoodsDetail(skuid, (res) => {
        this.goodsId = res;
        this.getGoodsComment();
      });
    }

    this.getGoodsDetailHorn();
    this.getStore();
    this.checkCollect(skuid, eventType);
  },

  //获取团购列表
  getGroup(skuid, eventType) {
    WXRQ.getGroup({
      skuId: skuid,
      eventType: eventType
    }).then(res => {
      let data = res.data.data;
      if (data && data.length) {
        this.data.group.splice(0, data.length, data);
        this.setData({
          group: this.data.group
        });
      }
    }).catch(err => {
      console.error(err);
    });
  },
  // 返回顶部
  onPageScroll: function(res) {
    if (res.scrollTop > 300) {
      this.setData({
        footShare: true
      });
    } else {
      this.setData({
        footShare: false
      });
    }
  },

  //获取商品详情
  getGoodsDetail(skuId, cb) {
    //itemDeleteTime  spuDeleteTime  itemDisabled   spuDisabled
    WXRQ.getDefultItem({
      skuId: skuId
    }).then(res => {
      this.goodsDeal(skuId, res, cb);
    }).catch(err => {
      this.setData({
        empty: true
      });
      console.error(err);
    });
  },
  //获取团购商品详情
  getGroupGoodsDetail(skuId, cb) {
    WXRQ.getGroupGoodsDetail({
      skuId: skuId
    }).then(res => {
      this.goodsDeal(skuId, res, cb);
    }).catch(err => {
      this.setData({
        empty: true
      });
      console.error(err);
    });
  },
  //获取商品后的数据处理
  goodsDeal(skuId, res, cb) {
    if (res.data && res.data.data) {
      // if (res.data.data.owner * 1 && this.data.store && this.data.store.userId != res.data.data.owner) {
      //   //拦截自定义商品
      //   this.setData({
      //     empty: true
      //   });
      //   return;
      // } else
      if (res.data.data.itemDeleteTime || res.data.data.itemDisabled) { //禁用
        this.setData({
          empty: true
        });
      } else {
        let spec = res.data.data.spec;
        for (let i = 0; i < spec.length; i++) {
          if (spec[i].spuDeleteTime || spec[i].spuDisabled) {
            this.setData({
              empty: true
            });
          }
        }
      }

      let body;
      if (res.data.data.body) {
        body = JSON.stringify(res.data.data.body);
        delete res.data.data.body;
      }
      // 视频数据格式整理
      if (res.data.data.videoUrl) {
        res.data.data.slide.unshift({
          videoUrl: res.data.data.videoUrl,
          picUrl: res.data.data.slide[0].picUrl
        })
      }
      this.setData({
        goods: res.data.data,
        // detail: body ? true : false,
        attribute: res.data.data.spec //属性数据
      });
      this.converBenefit(res.data.data.spec);
      cb && cb(res.data.data.itemId);
      this.dealStr(res.data.data.spec, res.data.data.spuId, skuId); //处理拼接属性字段

      if (body) {
        WxParse.wxParse('article', 'html', JSON.parse(body), this, 0); //富文本
      }
      // Service.startCountDate({
      //   endDate: [res.data.data.goodsDetail.spikeTime],
      //   thisObj: this
      // });
    } else {
      this.setData({
        empty: true
      });
    }
  },
  //获取收益列表
  converBenefit(arry) {
    if (arry && arry.length) {
      let len = arry.length,
        arr = [];
      for (let i = 0; i < len; i++) {
        for (let j = 0; j < arry[i].sku.length; j++) {
          arr.push(arry[i].sku[j].id);
        }
      }
      WXRQ.getBenefit(arr).then(res => {
        this.setData({
          benefit: res.data.data
        });
      }).catch(err => {
        console.error(err);
      });
    }
  },
  //获取喇叭
  getGoodsDetailHorn() {
    WXRQ.getGoodsDetailHorn({
      classify: 1,
      count: 100
    }).then(res => {
      this.setData({
        horn: res.data.data
      });
    }).catch(err => {
      console.error();
    });
  },
  //获取评论
  getGoodsComment() {
    WXRQ.getGoodsComment({
      itemId: this.goodsId,
      page: 1,
      pageSize: 5
    }).then(res => {
      this.setData({
        commentList: (res.data.data && res.data.data.rows) || null
      });
    }).catch(err => {
      console.error(err);
    });
  },
  // 获取店铺信息(包含更新店铺信息)
  getStore() {
    /**团购商品 */
    // if (this.data.eventType == 3) {
    //   if (this.fuid) {
    //     this.getGroupStoreById(app.globalData.official ? '' : this.fuid);
    //   } else {
    //     WXRQ.isLeader().then(res => {
    //       if (res.data.data.leaderJudge == 1) { //不是团长
    //         wx.setStorageSync('myIsGroup', '0');
    //         this.getGroupStoreById(app.globalData.official ? '' : this.fuid);
    //       } else if (res.data.data.disabled) { //是团长 但是被禁用
    //         wx.setStorageSync('myIsGroup', '0');
    //         this.getGroupStoreById(app.globalData.official ? '' : this.fuid);
    //       } else {
    //         wx.setStorageSync('myIsGroup', '1'); //是团长
    //         this.getGroupStoreById(wx.getStorageSync('uid'));
    //       }
    //       app.globalData.official = null;
    //     }).catch(err => {
    //       console.error(err);
    //     });
    //   }
    //   return;
    // }
    let type = this.data.eventType == 3 ? 2 : 1; // 1普通小店 2团购小店'
    /**普通商品 */
    WXRQ.findStore({ //优先级：userId,token,token上级，平台
      userId: this.fuid || app.globalData.fuid || '',
      type: type
    }).then(res => {
      let store = res.data.data;
      if (store.userId == this.fuid && store.userId != wx.getStorageSync('uid')) { //userid的店铺

      } else if (store.userId == wx.getStorageSync('uid')) { //我自己的店铺
        if (type == 2) { //团购
          wx.setStorageSync('myIsGroup', "1");
          wx.setStorageSync('myGroupStore', store);
        } else { //普通
          wx.setStorageSync('myIsStore', '1');
          wx.setStorageSync('myStore', store);
        }

      } else { //查到了平台或者上级
        if (type == 2) { //团购
          wx.setStorageSync('myIsGroup', "0");
        } else { //普通
          wx.setStorageSync('myIsStore', '0');
        }

      }
      this.setStore(store);
    }).catch(err => {
      console.error(err)
    })


    // if (this.fuid) {
    //   this.getStoreById(this.fuid);
    // } else {
    //   WXRQ.isUserstore({
    //     userIds: wx.getStorageSync('uid')
    //   }).then((res) => {
    //     if (res.data && res.data.data) {
    //       if (res.data.data.flg == false) {
    //         wx.setStorageSync('myIsStore', '0'); //自己没有店铺
    //         CommonService.getOtherStore(cb => {
    //           if (app.globalData.storeInfo) {
    //             this.setStore(app.globalData.storeInfo); // 店铺赋值
    //           } else {
    //             this.getStoreById('');
    //           }
    //         })
    //       } else { //自己有店铺
    //         this.setStore(res.data.data); // 店铺赋值
    //         wx.setStorageSync('myIsStore', '1'); //自己有店铺 当前店铺是自己的
    //         wx.setStorageSync('myStore', res.data.data);
    //       }
    //     }
    //   }).catch(err => {
    //     console.error(err);
    //   });
    // }
  },
  // 店铺赋值
  setStore(store) {
    // if (this.data.goods && this.data.goods.owner * 1 && store.userId != this.data.goods.owner) { //拦截自定义商品
    //   this.setData({
    //     empty: true,
    //     goods: null,
    //   });
    //   return;
    // }
    if (store.logo) {
      store.logo = store.logo.startsWith('http') ? store.logo : this.data.ossUrl + store.logo;
    }
    this.setData({
      store: store || null
    });
  },

  //获取userId的店铺，或者创小主
  // getStoreById(userId) {
  //   WXRQ.getGoodsStore({
  //     userId: userId || '' //点的是谁的 链接
  //   }).then(res => {
  //     this.setStore(res.data.data); //店铺赋值处理
  //   }).catch(err => {
  //     console.error(err);
  //   });
  // },
  //获取userId的团购店铺，或者创小主
  // getGroupStoreById(userId) {
  //   WXRQ.getGoodsGroupStore({
  //     userId: userId || '' //点的是谁的 链接
  //   }).then(res => {
  //     if (res.data.data.logo) {
  //       res.data.data.logo = res.data.data.logo.startsWith('http') ? res.data.data.logo : this.data.ossUrl + res.data.data.logo;
  //     }
  //     this.setData({
  //       store: res.data.data || null
  //     });
  //     if (res.data.data.userId == wx.getStorageSync('uid')) {
  //       wx.setStorageSync('myGroupStore', res.data.data);
  //     } else if (res.data.data.storeId != res.data.data.userId) {
  //       app.globalData.groupStoreInfo = res.data.data;
  //     }
  //   }).catch(err => {
  //     console.error(err);
  //   });
  // },

  //整理默认属性字段
  dealStr(data, spuId, skuId) {
    let str = '',
      currentItem = [];
    let noExprize, price, unit, marketPrice, stock, salesCount;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].id == spuId) {
        currentItem[0] = i;
        str = str + data[i].spuName;
        marketPrice = data[i].marketPrice;

        for (let j = data[i].sku.length - 1; j >= 0; j--) {
          if (data[i].sku[j].id == skuId) {
            noExprize = true;
            currentItem[1] = j;
            str = str + ' ' + data[i].sku[j].skuName;
            price = data[i].sku[j].price;
            unit = data[i].sku[j].unit;
            stock = data[i].stock; // Math.floor(data[i].stock / unit);    不需要算出最小单位
            salesCount = data[i].salesCount; // Math.floor((data[i].salesCount || 0) / unit);
            break;
          }
        }
      }
    }
    if (noExprize) {
      this.setData({
        currentItem: currentItem,
        currentAttr: {
          'price': price,
          'unit': unit, //该套装数目
          'marketPrice': marketPrice,
          'id': skuId,
          'spuId': spuId,
          'stock': stock,
          'salesCount': salesCount,
          'num': (this.data.currentAttr && this.data.currentAttr.num) || 1,
          'attr': str
        }
      });
    } else {
      this.setData({
        empty: true
      });
    }
  },


  //去选择属性
  attributeSelect() {
    if (this.data.eventType != 5) { //入店礼包不能切换
      this.setData({
        tableShow: true
      });
    }
  },
  //切换属性
  swichAttribute(e) {
    this.setData({
      currentAttr: e.detail.value
    });
    this.checkCollect(e.detail.value.id, this.data.eventType);
  },
  //更换数量
  changeNum(e) {
    this.setData({
      'currentAttr.num': e.detail.value.num
    });
  },
  //确定属性
  confirmAttribute(e) {
    if (this.addShopSelect) { //如果是添加购物车或者立即购买时候的确定面板，则确定后直接跳转
      this.addShopping();
    } else if (this.orderConfirmSelect) {
      this.goorderconfirm();
    } else {
      this.addShopSelect = null;
      this.orderConfirmSelect = null;
    }
  },
  closeAttribute(e) {
    this.addShopSelect = null;
    this.orderConfirmSelect = null;
  },
  //查询收藏状态
  checkCollect(skuId, eventType) {
    WXRQ.checkCollect({
      skuId: skuId,
      eventType: eventType || 1
    }).then(res => {
      this.setData({
        is_collect: res.data.data.isCollect
      });
    }).catch(err => {
      console.error(err);
    });
  },

  //添加 取消 收藏
  addCollect(e) {
    if (this.data.is_collect) {
      WXRQ.deleteCollect({
        skuId: this.data.currentAttr.id,
        eventType: this.data.eventType || 1
      }).then(res => {
        this.setData({
          is_collect: false
        });
      }).catch(err => {
        console.error(err);
      });
    } else {
      WXRQ.addCollect({
        skuId: this.data.currentAttr.id,
        eventType: this.data.eventType || 1
      }).then(res => {
        this.setData({
          is_collect: true
        });
      }).catch(err => {
        console.error(err);
      });
    }
  },

  //预览图片
  prevImg(e) {
    let src = e.currentTarget.dataset.src,
      urls = [];
    if (Array.isArray(src)) {
      for (let i = 0; i < src.length; i++) {
        if (!src[i].videoUrl) {
          urls.push(this.data.ossUrl + src[i].picUrl);
        }
      }
    } else {
      urls.push(this.data.ossUrl + src);
    }
    wx.previewImage({
      urls: urls
    });
  },

  //查看更多评论
  gocomment() {
    wx.navigateTo({
      url: `/pages/comment/comment?itemId=${this.goodsId}`
    });
  },
  //进店逛逛
  gostore(e) {
    if (this.data.eventType == 3) {
      wx.navigateTo({
        url: `/pages/tg_store/tg_store?fuid=${this.data.store.userId}`
      });
    } else {
      wx.reLaunch({
        url: `/pages/my_store/my_store?fuid=${this.data.store.userId}&type=goods`
      });
    }
  },
  //加入购物车
  addShopping() {
    if (this.data.eventType != 5 && !this.addShopSelect) { //不是入店礼包 且 没有切换过属性面板
      this.addShopSelect = true;
      this.setData({
        tableShow: true
      });
      return;
    }
    this.addShopSelect = null;
    if (this.data.currentAttr) {
      if (this.data.currentAttr.stock * 1 >= this.data.currentAttr.num * this.data.currentAttr.unit) {
        WXRQ.addShopping({
          count: this.data.currentAttr.num,
          skuId: this.data.currentAttr.id,
          spuId: this.data.currentAttr.spuId,
          gainUserId: (this.data.store && this.data.store.userId) || (wx.getStorageSync('myIsStore') == '1' ? wx.getStorageSync('uid') : (this.fuid || app.globalData.fuid)), //点的是谁的 链接
          eventType: this.data.eventType,
          //团购商品   groupDeliverType  1 2 3 线上支付 到家自提 线下支付
          payMethod: this.data.eventType != 3 ? '' : this.data.goods.groupDeliverType
        }).then(res => {
          wx.showToast({
            title: '添加成功'
          });
          this.data.currentAttr.stock--; //减库存，形同虚设，鸡肋，可删
        }).catch(err => {
          console.error(err);
        });
      } else {
        wx.showToast({
          title: '库存不足',
          icon: 'none'
        });
      }

    } else {
      wx.showToast({
        title: '请选择商品属性',
        icon: 'none'
      });
    }
  },
  //立即购买授权
  getUserInfo(e) {
    CommonService.getUserInfo(e.detail, res => {
      this.goorderconfirm();
    });
  },
  //立即购买
  goorderconfirm() {
    if (this.data.eventType != 5 && !this.orderConfirmSelect) { //不是入店礼包 且 没有切换过属性面板
      this.orderConfirmSelect = true;

      this.setData({
        tableShow: true
      });
      return;
    }
    this.orderConfirmSelect = null;

    if (this.data.currentAttr) {
      if (this.data.currentAttr.stock * 1 >= this.data.currentAttr.num * this.data.currentAttr.unit) {

        if (this.data.goods.maxCount && this.data.goods.maxCount * 1 && this.data.goods.maxCount * 1 < this.data.currentAttr.num * this.data.currentAttr.unit) { //限购
          wx.showToast({
            title: `最大限购${Math.floor(this.data.goods.maxCount / this.data.currentAttr.unit)}件`,
            icon: 'none'
          })
          return;
        }


        let payMethod = this.data.eventType != 3 ? '' : this.data.goods.groupDeliverType;
        WXRQ.submitPreOrder({
          userStores: [{
            gainUserId: (this.data.store && this.data.store.userId) || (wx.getStorageSync('myIsStore') == '1' ? wx.getStorageSync('uid') : (this.fuid || app.globalData.fuid)), //受益人 是店铺主人
            userStoreType: this.data.eventType == 3 ? 2 : 1, //用户店铺类型  1 普通小店 2 团购小店
            userStoreId: (this.data.store && this.data.store.id) || '', //用户店铺id
            userStoreName: (this.data.store && this.data.store.name) || '', //用户店铺 名称
            items: [{
              count: this.data.currentAttr.num,
              skuId: this.data.currentAttr.id,
              spuId: this.data.currentAttr.spuId,
              eventType: this.data.eventType || 1, //1普通/2秒杀/3社区拼团/4砍价/5入店礼包/6免费领礼品
              //团购商品  groupDeliverType  1 2 3 线上支付 到家自提 到团长家提
              payMethod: payMethod,
              unit: this.data.currentAttr.unit
            }]
          }],
          cart: false
        }).then(res => {
          PreOrder.preOrder = res.data.data;
          wx.navigateTo({
            url: `/pages/order_confirm/order_confirm?eventType=${this.data.eventType}&payMethod=${payMethod}`
          });
        }).catch(err => {
          console.error(err);
        });
      } else {
        wx.showToast({
          title: '库存不足',
          icon: 'none'
        });
      }
    } else {
      wx.showToast({
        title: '请选择商品属性',
        icon: 'none'
      });
    }
  },
  //去首页
  goindex() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (app.globalData.official) {
      this.fuid = null;
      app.globalData.fuid = null;
      this.getStore();
      // app.globalData.official = null;
    }
    wx.getSetting({
      success: res => {
        let noPhotosAlbum = wx.getStorageSync('noPhotosAlbum');
        if (res.authSetting['scope.writePhotosAlbum']) { //受过权
          noPhotosAlbum && wx.removeStorageSync('noPhotosAlbum');
          this.setData({
            noPhotosAlbum: false
          });
        } else { //没受过权
          if (noPhotosAlbum) { //询问过
            this.setData({
              noPhotosAlbum: noPhotosAlbum
            });
          } else { //没询问过
            this.setData({
              noPhotosAlbum: false
            });
          }
        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    Service.endCountDate();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(e) {
    return {
      title: this.data.goods.itemName,
      imageUrl: this.data.ossUrl + this.data.goods.thumbnail,
      path: `/pages/goodsDetail/goodsDetail?fuid=${this.data.store.userId}&skuId=${this.data.currentAttr.id}&eventType=${this.data.eventType}`
    };
  },
  //分享面板展示
  shareTap() {
    this.setData({
      shareBarShow: true
    });
  },
  //关闭海报时候同时关闭分享面板
  closeTap() {
    this.setData({
      shareBarShow: false
    });
  },

  //海报展示
  savePoster() {
    this.setData({
      doCvs: !this.data.doCvs
    });
  },
  goIndex(e) {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },
  // 轮播视频处理
  videoStart() {
    this.setData({
      swipauto: false
    })
  },
  videoEnd() {
    this.setData({
      swipauto: true
    })
  }

});