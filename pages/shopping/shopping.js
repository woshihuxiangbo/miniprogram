// pages/shopping/shopping.js
import WXRQ from '../../utils/wxrq.js';
import PreOrder from '../../model/preOrder.js';
import PayStatus from '../../model/payStatus.js';
import STRSHORT from '../../utils/strShort.js';
import Service from '../../utils/service.js';
import CommonService from '../../utils/common.js';
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    startNum: [],
    appStoreId: '',
    ossUrl: '',
    shortName: '',
    empty: 0, // 0 未知  1 为空  2有货
    goodsList: null,
    manageShop: false, //管理商品模式
    recommend: null,

    selectArr: null, //商品选择数组
    isStore: null, //店铺选择数组
    totleOpt: null, //全选 

    totlePrice: '0.00' //总价
  },
  //选择框选择
  chooseTap(e) {
    let dataset = e.currentTarget.dataset;
    if (dataset.hasOwnProperty("idx")) { //选择商品
      let goods = this.data.goodsList[dataset.storeidx].items[dataset.idx];
      if (goods.spuDisabled || goods.itemDisabled || !goods.skuId) { //商品已下架
        return;
      }
      if ((goods.unit * goods.count) > goods.stock) { //无库存
        wx.showToast({
          title: '库存不足',
          icon: 'none'
        })
        return;
      }
      if (goods.countLimit && goods.countLimit * 1 && (goods.unit * goods.count) > goods.countLimit) { //限购
        wx.showToast({
          title: `最大限购${Math.floor(goods.countLimit / goods.unit)}件`,
          icon: 'none'
        })
        return;
      }
      this.data.selectArr[dataset.storeidx][dataset.idx] = !this.data.selectArr[dataset.storeidx][dataset.idx];
      let mm = this.forSelect({ //检查是否全选了
        arr: this.data.selectArr[dataset.storeidx],
        onlyall: true
      })
      this.data.isStore[dataset.storeidx] = mm.all;
      this.setData({
        selectArr: this.data.selectArr,
        isStore: this.data.isStore,
        totleOpt: this.data.isStore.indexOf(false) < 0 ? true : false
      })
      this.calculateTotalPrice();
    } else if (dataset.hasOwnProperty("storeidx")) { //选择店铺
      if (this.data.isStore[dataset.storeidx]) {
        this.data.selectArr[dataset.storeidx].fill(false);
        this.data.isStore[dataset.storeidx] = false;
      } else {
        this.data.isStore[dataset.storeidx] = true;
        let items = this.data.goodsList[dataset.storeidx].items;
        for (let i = 0; i < items.length; i++) { //检查库存
          if (items[i].spuDisabled || items[i].itemDisabled || !items[i].skuId) { //下架
            this.data.selectArr[dataset.storeidx][i] = false;
          } else if ((items[i].unit * items[i].count) > items[i].stock || (items[i].countLimit && items[i].countLimit * 1 && (items[i].unit * items[i].count) > items[i].countLimit)) { //无库存或限购
            this.data.selectArr[dataset.storeidx][i] = false;
          } else {
            this.data.selectArr[dataset.storeidx][i] = true;
          }
        }
      }
      this.setData({
        selectArr: this.data.selectArr,
        isStore: this.data.isStore,
        totleOpt: this.data.isStore.indexOf(false) < 0 ? true : false //检查店铺是否全选
      })
      this.calculateTotalPrice();
    } else if (dataset.hasOwnProperty("totle")) { //全选
      if (this.data.totleOpt) {
        for (let i = this.data.selectArr.length - 1; i >= 0; i--) {
          this.data.selectArr[i].fill(false);
        }
        this.data.isStore.fill(false);
      } else {
        for (let i = this.data.selectArr.length - 1; i >= 0; i--) {
          let items = this.data.goodsList[i].items;
          for (let j = 0; j < items.length; j++) { //检查库存
            if (items[j].spuDisabled || items[j].itemDisabled || !items[j].skuId) { //商品下架
              this.data.selectArr[i][j] = false;
            } else if ((items[j].unit * items[j].count) > items[j].stock || (items[j].countLimit && items[j].countLimit * 1 && (items[j].unit * items[j].count) > items[j].countLimit)) { //无库存或限购
              this.data.selectArr[i][j] = false;
            } else {
              this.data.selectArr[i][j] = true;
            }
          }
        }
        this.data.isStore.fill(true);
      }
      this.setData({
        selectArr: this.data.selectArr,
        isStore: this.data.isStore,
        totleOpt: !this.data.totleOpt
      })
      this.calculateTotalPrice();
    }
  },
  //选择数量
  chooseNum(e) {
    let storeidx = e.currentTarget.dataset.storeidx;
    let idx = e.currentTarget.dataset.idx;
    let num = e.detail.value;

    // let goods = this.data.goodsList[storeidx].items[idx];
    // if (goods.spuDisabled || goods.itemDisabled || !goods.skuId) return; //商品下架


    this.data.goodsList[storeidx].items[idx].count = num;
    this.data.selectArr[storeidx][idx] = true;
    this.setData({
      selectArr: this.data.selectArr
    })
    this.calculateTotalPrice();
    WXRQ.chooseCarNum({
      count: num,
      gainUserId: this.data.goodsList[storeidx].gainUserId, //受益人 区分
      skuId: this.data.goodsList[storeidx].items[idx].skuId,
      storeId: this.data.goodsList[storeidx].storeId
    }).then(res => {
      this.data.startNum[storeidx] || (this.data.startNum[storeidx] = []);
      this.data.startNum[storeidx][idx] = num;
      this.setData({
        startNum: this.data.startNum
      })
    }).catch(err => {
      console.error(err)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // wx.hideShareMenu()
    this.setData({
      appStoreId: app.globalData.siteinfo.subDomain,
      ossUrl: app.globalData.siteinfo.imgUrl,
      shortName: app.globalData.shortName,
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      empty: 0, // 0 未知  1 为空  2有货
      goodsList: null,
      selectArr: null, //商品选
      shopOpt: false, //店铺选
      totleOpt: false, //全选： 0 不限制  1 全选  -1 全部取消
      totlePrice: '0.00',
      manageShop: false, //管理商品模式
      recommend: null,
      payStatus: false
    })
    this.page = 1;
    this.totle_page = null;

    this.carEventType = null; // 检查eventType 类型
    this.groupPayMethod = null; //检查团购支付方式
    this.carStore = null; //检查 购物车是否跨店

    this.getShopping();
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

  //购物车数据
  getShopping() {
    WXRQ.getShopping({}).then(res => {
      let data = res.data.data;
      this.setData({
        goodsList: data,
        empty: data.length ? 2 : 1,
      })
      if (!this.data.goodsList || !this.data.goodsList.length) {
        this.getEmptyShop();
      }
      let totleCount = 0, //商品总数
        selectArr = [], //选择数组
        isStore = []; //店铺数组
      for (let i = data.length - 1; i >= 0; i--) {
        totleCount += data[i].items.length;
        let mm = this.forSelect({
          arr: data[i].items,
          str: 'select'
        })
        selectArr[i] = mm.arr;
        isStore[i] = mm.all;
      }
      this.setData({
        totleCount: totleCount, //商品总数
        selectArr: selectArr, //选择数组
        isStore: isStore, //店铺数组
        totleOpt: isStore.indexOf(false) < 0 ? true : false
      })
    }).catch(err => {
      console.error(err)
      if (!this.data.goodsList) {
        this.setData({
          empty: 1
        })
        this.getEmptyShop();
      }
    })
  },

  //获取推荐 商品
  getEmptyShop() {
    if (PayStatus.pay) {
      PayStatus.pay = null;
      this.setData({
        payStatus: true
      })
    }
    this.activeList();
  },
  //今日推荐分页
  page: 1,
  totle_page: null,
  activeList() {
    if (this.totle_page && this.page > this.totle_page) {
      this.setData({
        isLast: true
      })
      return;
    }
    WXRQ.getGoodsList({
      page: this.page,
      pageSize: 5,
      cartRecommend: 1
    }).then(res => {
      this.data.recommend && (this.data.recommend.concat(res.data.data.rows))
      this.setData({
        recommend: this.data.recommend || res.data.data.rows
      })
      this.totle_page = Math.ceil(res.data.data.rowCount / 5);
      this.page++;
    }).catch(err => {
      console.error(err)
    })
  },


  carEventType: null, // 检查eventType 类型
  groupPayMethod: null, //检查团购支付方式
  carStore: null,
  //确认订单
  goorderconfirm(e) {
    CommonService.getUserInfo(e.detail, res => {
      let len = this.data.selectArr.length,
        arr = [];
      for (let i = len - 1; i >= 0; i--) {
        for (let j = this.data.selectArr[i].length - 1; j >= 0; j--) {
          if (this.data.selectArr[i][j]) {
            //检查是否跨店下单
            this.carStore || (this.carStore = i);
            if (this.carStore != i) {
              wx.showToast({
                title: '不支持跨店铺下单哦',
                icon: 'none',
                duration: 2000
              })
              this.carStore = null; //检查 购物车是否跨店
              return;
            }
            // 检查eventType 类型
            this.carEventType || (this.carEventType = this.data.goodsList[i].items[j].eventType);
            if (this.carEventType != this.data.goodsList[i].items[j].eventType) {
              wx.showToast({
                title: '普通商品不能和团购商品一起下单哦',
                icon: 'none',
                duration: 2000
              })
              this.carEventType = null;
              return;
            }
            if (this.carEventType == 3) { //团购商品
              this.groupPayMethod || (this.groupPayMethod = this.data.goodsList[i].items[j].payMethod);
              if (this.groupPayMethod != this.data.goodsList[i].items[j].payMethod) {
                wx.showToast({
                  title: '您只能选择同一种支付方式的商品下单哦',
                  icon: 'none',
                  duration: 2000
                })
                this.groupPayMethod = null;
                return;
              }
            }

            arr[i] || (arr[i] = {
              gainUserId: this.data.goodsList[i].gainUserId || '',
              userStoreId: this.data.goodsList[i].userStoreId || '',
              userStoreName: this.data.goodsList[i].userStoreName || '',
              userStoreType: this.data.goodsList[i].userStoreType || '',
              items: []
            });

            arr[i].items.push({
              skuId: this.data.goodsList[i].items[j].skuId,
              spuId: this.data.goodsList[i].items[j].spuId,
              count: this.data.goodsList[i].items[j].count,
              eventType: this.data.goodsList[i].items[j].eventType || '',
              unit: this.data.goodsList[i].items[j].unit
            })
          }
        }
      }

      for (let i = 0; i < arr.length; i++) { //去除数组中的 undifined
        if (!arr[i]) {
          arr.splice(i, 1);
          i--;
        }
      }
      if (arr.length) {
        WXRQ.submitPreOrder({
          userStores: arr,
          cart: true
        }).then(res => {

          PreOrder.preOrder = res.data.data;
          wx.navigateTo({
            url: `/pages/order_confirm/order_confirm?eventType=${this.carEventType}&payMethod=${this.groupPayMethod}`,
            success: res => {
              this.carEventType = null;
            }
          })
        }).catch(err => {

          console.error(err)
        })
      } else {
        wx.showToast({
          title: '请选择商品属性',
          icon: 'none'
        })
      }
    })
  },
  //批量收藏
  addCollectList() {
    let len = this.data.selectArr.length,
      arr = []; //要移除的 skuid 数组
    for (let i = len - 1; i >= 0; i--) {
      for (let j = this.data.selectArr[i].length - 1; j >= 0; j--) {
        if (this.data.selectArr[i][j]) {
          arr.push({
            skuId: this.data.goodsList[i].items[j].skuId,
            eventType: this.data.goodsList[i].items[j].eventType
          });
        }
      }
    }
    WXRQ.addCollectList(arr).then(res => {
      wx.showToast({
        title: '收藏成功',
      })
    }).catch(err => {
      console.error(err)
    })
  },
  //管理购物车
  manageShopTap() {
    for (let i = this.data.selectArr.length - 1; i >= 0; i--) {
      this.data.selectArr[i].fill(false);
    }
    this.data.isStore.fill(false);

    this.setData({
      manageShop: !this.data.manageShop,
      totleOpt: false,
      selectArr: this.data.selectArr,
      isStore: this.data.isStore,
      totlePrice: '0.00'
    })
  },
  //删除购物车商品
  deleteTap() {
    if (this.data.totleOpt) {
      WXRQ.clearCarItem().then(res => {
        this.getEmptyShop();
        this.setData({
          goodsList: null,
          totleOpt: false,
          selectArr: null,
          isStore: null,
          totlePrice: '0.00',
          empty: 1
        })
      }).catch(err => {
        console.error(err)
      })
    } else { //移除购物车的一部分
      let len = this.data.selectArr.length,
        arr = []; //要移除的 skuid 数组
      for (let i = len - 1; i >= 0; i--) {
        for (let j = this.data.selectArr[i].length - 1; j >= 0; j--) {
          if (this.data.selectArr[i][j]) {
            arr.push(this.data.goodsList[i].items[j].skuId);
          }
        }
      }
      WXRQ.deleteCarItem(arr).then(res => {
        this.getShopping(); //更新购车 数据
      }).catch(err => {
        console.error(err)
      })
    }
  },
  // 购物车商品进入详情
  goDetail(e) {
    if (!e.target.dataset.hasOwnProperty('num')) {
      let storeIdx = e.currentTarget.dataset.storeidx;
      let idx = e.currentTarget.dataset.idx;
      let store = this.data.goodsList[storeIdx];
      let item = store.items[idx];
      wx.navigateTo({
        url: `/pages/goodsDetail/goodsDetail?goodsId=${item.itemId || 1}&skuId=${item.skuId}&eventType=${item.eventType}&fuid=${store.gainUserId}`,
      })
    }
  },
  //推荐商品进入详情
  goGoodsDetail(e) {
    if (e.target.dataset.share != 'share') {
      let skuId = e.currentTarget.dataset.skuid;
      let itemId = e.currentTarget.dataset.itemid;
      wx.navigateTo({
        url: `/pages/goodsDetail/goodsDetail?skuId=${skuId}&goodsId=${itemId}&eventType=1`,
      })
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.empty == 1) {
      this.getEmptyShop();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(e) {
    if (e.from == 'button' && this.shareGoodsStatus) {
      let myIsStore = wx.getStorageSync('myIsStore');
      let uid = wx.getStorageSync('uid');
      let fuid = (myIsStore == '1') ? uid : (app.globalData.storeInfo ? app.globalData.storeInfo.userId : uid);
      return {
        title: this.data.shareGoods.name,
        imageUrl: this.data.ossUrl + this.data.shareGoods.thumbnail,
        path: `/pages/goodsDetail/goodsDetail?fuid=${fuid}&skuId=${this.data.shareGoods.skuId}&eventType=1`
      }
    }
    return Service.shareObj();
  },
  //分享 包括右下角的分享 与 分享赚
  shareTap(e) {
    CommonService.getUserInfo(e.detail, res => {
      if (e.currentTarget.dataset.share == 'share') { //推荐商品的分享
        let data = this.data.recommend;
        for (let i = 0; i < data.length; i++) {
          if (data[i].skuId == e.currentTarget.dataset.skuid) {
            this.setData({
              shareGoods: data[i]
            })
            this.shareGoodsStatus = true;
            break;
          }
        }
      }
      this.setData({
        shareBarShow: true
      })
    })

  },
  savImg(e) {
    if (this.shareGoodsStatus) { //商品分享
      this.setData({
        doCvs: this.data.doCvs ? false : true
      })
    } else { //右下角分享
      this.setData({
        cvsShow: true
      })
    }

  },
  closePoster(e) {
    this.setData({
      shareBarShow: false
    })
    this.shareGoodsStatus = null;
  },
  /*
   *循环数组查看选中情况  
   * arr ：数组, 
   * str ：对应字段,
   *  onlyall ：是否 仅仅检查是否全为true
   */
  forSelect(options) {
    let a = [],
      all;
    if (options.str) {
      for (let i = options.arr.length - 1; i >= 0; i--) {
        if (options.arr[i][options.str]) {
          a[i] = true;
        } else {
          all = 1;
          a[i] = false;
          if (options.onlyall) {
            break;
          }
        }
      }
    } else {
      for (let i = options.arr.length - 1; i >= 0; i--) {
        if (options.arr[i]) {
          a[i] = true;
        } else {
          all = 1;
          a[i] = false;
          if (options.onlyall) {
            break;
          }
        }
      }
    }
    return {
      arr: options.onlyall ? null : a,
      all: all ? false : true
    };
  },
  //计算总价
  calculateTotalPrice() {
    let sum = 0,
      len = this.data.selectArr && this.data.selectArr.length;
    for (let i = len - 1; i >= 0; i--) {
      let leng = this.data.selectArr[i].length;
      for (let j = leng - 1; j >= 0; j--) {
        this.data.selectArr[i][j];
        if (this.data.selectArr[i][j]) {
          sum += this.data.goodsList[i].items[j].price * this.data.goodsList[i].items[j].count * this.data.goodsList[i].items[j].unit;
        }
      }
    }
    this.setData({
      totlePrice: (sum / 100).toFixed(2)
    })
  },
})