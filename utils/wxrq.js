import CommonService from './common.js';
import Service from './service.js';
import siteinfo from '../siteinfo.js'
export default {
  //获取店铺ID  app配置
  getStoreId(data, cb) {
    wx.request({
      url: `${siteinfo.domain}/${siteinfo.subDomain}/${siteinfo.apiVersion}/item/u/store/getByAppId`,
      method: 'GET',
      data: data,
      success: res => {
        if (res.data && res.data.data) {
          let obj = {};
          res.data.data.storeId && (obj.subDomain = res.data.data.storeId);
          res.data.data.setting && res.data.data.setting.domain && (obj.domain = res.data.data.setting.domain);
          res.data.data.setting && res.data.data.setting.apiVersion && (obj.apiVersion = res.data.data.setting.apiVersion);
          res.data.data.setting && res.data.data.setting.mobileDomain && (obj.mgtUrl = res.data.data.setting.mobileDomain);
          res.data.data.setting && res.data.data.setting.ossStaticDomain && (obj.imgUrl = res.data.data.setting.ossStaticDomain);
          Object.assign(siteinfo, obj);
          wx.setStorageSync('siteinfo', obj);
        }
        cb && cb();
      },
      fail: err => {
        if (this.setNum >= 5) {
          wx.showModal({
            title: '',
            content: '网络错误',
            // showCancel: false,
            // confirmText: '重试',
            // success: res => {
            //   this.getStoreId(data, cb);
            // }
          })
          return;
        }
        this.setNum || (this.setNum = 0);
        this.setNum++;
        this.getStoreId(data, cb);
      }
    })
  },
  //获取二维码参数
  getQuery(url) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: url,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //获取上级店铺信息,优先上级，其次userId
  getSubById(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'user/userstore/findSubById',
        method: 'GET',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //查询店铺
  findStore(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'user/userstore/findStore',
        method: 'GET',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  /**
   * 登录页面
   */
  //授权登录
  login(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'user/wechatLogin',
        method: 'POST',
        withToken: false,
        is_login: true, //本地记录重新登录识别
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  /**
   * 普通商品分类，详情，购物车
   */
  //获取分类
  getCategory(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'item/u/item_category/list',
        data: data,
        type: 'go',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //获取商品列表
  getGoodsList(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'item/u/item/list',
        data: data,
        type: 'go',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //获取赚多少
  getBenefit(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'order/findGainMoney',
        data: data,
        method: 'POST',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  //获取团购商品分类列表
  getGrounpGoodsList(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'item/u/item/list',
        data: data,
        type: 'go',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },


  //获取商品详情
  getGoodsDetail(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `item/get`,
        data: data,
        showLoading: true,
        type: 'go',
        success: res => {
          resolve(res);
        },
        fail: err => {
          reject(err);
        }
      })
    })
  },
  //获取团购商品详情
  getGroupGoodsDetail(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `item/u/group/item_sku/get`,
        data: data,
        showLoading: true,
        type: 'go',
        success: res => {
          resolve(res);
        },
        fail: err => {
          reject(err);
        }
      })
    })
  },


  // 获取商品评论
  getGoodsComment(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/findbystoreItems`,
        data: data,
        method: 'POST',
        success: res => {
          resolve(res);
        },
        fail: err => {
          reject(err);
        }
      })
    })
  },

  //获取拼团成员
  getGroup(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/goods/userGroupList`,
        data: data,
        success: res => {
          resolve(res);
        },
        fail: err => {
          reject(err);
        }
      })
    })
  },

  //获取商品  所属店铺
  getGoodsStore(data) { //传userId，userId有对应店铺则是这个店铺，没有店铺或者userId为空，就是创小主
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/userstore/findbystore`,
        method: 'GET',
        data: data,
        success: res => {
          resolve(res);
        },
        fail: err => {
          reject(err);
        }
      })
    })
  },
  //获取商品  所属团购店铺
  getGoodsGroupStore(data) { //传userId，userId有对应店铺则是这个店铺，没有店铺或者userId为空，就是创小主
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/userstore/findByGroupStore`,
        method: 'GET',
        data: data,
        success: res => {
          resolve(res);
        },
        fail: err => {
          reject(err);
        }
      })
    })
  },
  //获取默认skuid 信息
  getDefultItem(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `item/u/item_sku/get`,
        data: data,
        type: 'go',
        success: res => {
          resolve(res);
        },
        fail: err => {
          reject(err);
        }
      })
    })
  },
  //获取商品页详情喇叭
  getGoodsDetailHorn(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `/msg/incomeMessageList`,
        data: data,
        success: res => {
          resolve(res);
        },
        fail: err => {
          reject(err);
        }
      })
    })
  },

  //获取二维码
  getQrcode(data, suc, fal) {
    CommonService.request({
      url: `user/qrCode`,
      method: 'POST',
      data: data,
      success: res => {
        suc && suc(res);
      },
      fail: err => {
        fal && fal(err);
      }
    })

  },
  //查询收藏
  checkCollect(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `goods/itemfavourite/findbyUser`,
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //添加收藏
  addCollect(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `goods/itemfavourite/addinfo`,
        showLoading: true,
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //批量收藏
  addCollectList(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `goods/itemfavourite/addallinfo`,
        method: 'POST',
        showLoading: true,
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //取消收藏
  deleteCollect(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `goods/itemfavourite/delete?skuId=${data.skuId}&eventType=${data.eventType}`,
        method: 'DELETE',
        showLoading: true,
        // data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 获得全部商品属性
  attributeSelect(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `item/u/item_spec/get`,
        type: 'go',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 切换商品属性  获得skuId
  swichAtt(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `item/u/item_sku/get_by_spec`,
        data: data,
        showLoading: true,
        type: 'go',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  //加入购物车
  addShopping(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'order/cart/addCart',
        method: 'POST',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //生成预订单
  submitPreOrder(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'order/generatePreOrder',
        method: 'POST',
        showLoading: true,
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //查询邮费
  checkPostage(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'order/expressFee',
        method: 'POST',
        showLoading: true,
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // //支付
  payMoney(data) {
    return new Promise((resolve, reject) => {
      Service.payMoney({
        url: 'order/pay/wxPayOrder',
        method: 'POST',
        data: data,
        showLoading: true,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //支付成功回调后台(订单)
  payCb(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'order/pay/sync/notify',
        method: 'POST',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //支付成功回调后台(充值)
  payPCb(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'order/pay/deposit/sync/notify',
        method: 'POST',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // //去付款
  rePay(data) {
    return new Promise((resolve, reject) => {
      Service.payMoney({
        url: 'order/pay/rePayOrder',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 获取默认地址
  getDefultAddress() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'user/useraddr/findbyisdefult',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //获取地址列表
  getAddressList() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'user/addrInfo',
        showLoading: true,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //修改默认地址
  editDefultAddress(id) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/useraddrisdefault/${id}`,
        showLoading: true,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //删除地址
  deleteAddress(id) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/useraddrdelete/${id}`,
        method: 'DELETE',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //编辑地址
  submitAddress(data) {
    return new Promise((resolve, reject) => {
      let url = data.id * 1 >= 0 ? `user/useraddrupdate` : `user/useraddradd`
      CommonService.request({
        url: url,
        method: 'POST',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  //获取{{shortName}}中心页面的 5 项数据
  getXzCenterData() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'user/userrelationinfo',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //编辑个人信息页面
  getEditUserInfo() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'user/userInfo',
        method: 'POST',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //保存个人信息
  saveUserInfo(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'user/userUpdate',
        data: data,
        method: 'POST',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //手机号传后台
  postPhoneNumber(detail) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'user/ismoblie',
        method: 'POST',
        data: {
          encryptedData: detail.encryptedData,
          iv: detail.iv
        },
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 获取首页数据
  getIndexData() {
    return new Promise((resolve, reject) => {
      return resolve();
      CommonService.request({
        url: 'item/u/adv/adv/getinfo/1',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  //获取购物车数据
  getShopping(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'order/cart/cartList',
        method: 'POST',
        data: data,
        success: res => {
          resolve(res);
        },
        fail: err => {
          reject(err);
        }
      })
    })
  },
  // 购物车数量更新
  chooseCarNum(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'order/cart/updateCart',
        method: 'POST',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 购物车商品移除
  deleteCarItem(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'order/cart/removeCart',
        method: 'POST',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //清空购物车
  clearCarItem() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'order/cart/clearCart',
        method: 'POST',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 获得index主页的 分类数据
  getIndexClassCategory() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'item/u/item/category/getlist',
        type: 'go',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })



  },
  // 订单列表
  getOrderList(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'order/orderList?v=1',
        method: 'post',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 订单详情
  getOrderDetail(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'order/orderDetail?v=1',
        // url: 'order/orderDetail',
        method: 'post',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 取消订单
  cancelOrder(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'order/cancelOrder',
        method: 'post',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //删除订单
  deleteOrder(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'order/addDeleteTimes',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //  获取 佣金收益明细
  getCommissionDetail(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/income/userGainList`,
        method: 'get',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 查询用户收藏的
  getUserCollect() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'user/depositdetail/find',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  //获取店铺信息
  getStoreMsg(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'user/userstore/findone',
        method: 'get',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },


  //编辑店铺
  editorStore(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'user/userstore/update',
        method: 'post',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  //增加店铺
  addStore(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'user/userstore/add',
        method: 'post',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  //工作台详情
  userrelationmoney() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'user/userrelationmoney',
        method: 'get',
        // data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  //我的团队详情
  myTeamDetail(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'user/userrelation/search',
        method: 'post',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },


  //我的团队
  myTeam(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'user/userrelation/team',
        method: 'get',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  //{{shortName}}中心用户信息
  userReationInfo() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'user/userrelationinfo',
        method: 'get',
        // data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },


  //商品分类
  // getGoodsCategory(parentId) {
  getGoodsCategory(data) { // { parentId:parentId ||0}
    return new Promise((resolve, reject) => {
      CommonService.request({
        // url: `item/u/item_category/list?pageSize=100&column=id,name,icon,itemCount,sortId,nameEn&sortOrder=sortId&sortBy=DESC&parentId=${parentId||0}`,
        url: `item/u/item_category/list?pageSize=100&column=id,name,icon,itemCount,sortId,nameEn&sortOrder=sortId&sortBy=DESC`,
        method: 'get',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  //团购商品分类
  getGroupGoodsCategory(parentId) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `item/u/item_category/list?pageSize=100&isGroup=true&column=id,name,icon,itemCount,sortId,nameEn&sortOrder=sortId&sortBy=DESC&parentId=${parentId || 0}`,
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  //获取推荐商品
  getRecommendedGoods(data) { // { page:1,pageSize:5,isRecommend:1}
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'item/u/item/list',
        type: 'go',
        data: data,
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  //获取首页banner
  getIndexBanner(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'content/u/adv/pic/list?column=id,title,imgUrl,sortId,storeId,articleId,skuId,eventId,externalUrl,linkType&sortOrder=sortId&sortBy=desc',
        method: 'get',
        data: data,
        type: 'go',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  //本月新品
  getNewGoods(data) { // { page:1,pageSize:100,isNew:1}
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'item/u/item/list',
        method: 'get',
        data: data,
        type: 'go',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  //热销商品
  getHotGoods(data) { // { page:1,pageSize:100,isHot:1}
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'item/u/item/list',
        method: 'get',
        data: data,
        type: 'go',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 热销团购商品
  getHotGroup() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `item/u/group/item/list?isGroupStoreItem=true&isHot=1&page=1&pageSize=18`,
        method: 'get',
        type: 'go',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },


  //获取团购商品列表
  getGoodsListGroup(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'item/u/group/item/list',
        data: data,
        type: 'go',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },


  // 待评论
  getCommentList() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'user/buyordercomment/findinfo',
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  //获取是否为{{lvConfig.lv1.name}}
  isUserstore(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'user/userstore/findbypage',
        method: 'get',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //  查询用户粉丝数  fans
  getFans(level, pageNum, pageSize) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/userfans/findinfo?&level=${level}&pageNum=${pageNum}&pageSize=${pageSize}`,
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //  获取消息
  getNotice(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/usermsg/findpage`,
        method: 'get',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  //首页文字
  getIndexTxt(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'msg/incomeMessageList',
        method: 'get',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  // 活动接口
  // getActivityList(type) {
  getActivityList(data) { // {type:5}
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `item/u/event/list?column=id,title,rule,type,voiceSrc`,
        method: 'get',
        data: data,
        type: 'go',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },


  // 活动接口另一个
  getActivityListOther(id) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `item/u/event/list?&eventId=${id}&column=type,title,rule,type`,
        method: 'get',
        type: 'go',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  //活动具体商品接口
  getActivityDetail(data) { // { eventId:eventId}
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'item/u/event/item/list?column=itemId,itemName,skuId,spuId,eventPrice,title,sortId,deleteTime,thumbnail,marketPrice&sortOrder=sortId&sortBy=desc',
        method: 'get',
        data: data,
        type: 'go',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },


  // 我的联系人
  getLinkman() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/userrelation/userparent/find`,
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  //收藏列表
  getCollectionList(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'goods/itemfavourite/findbyUserList',
        method: 'get',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //  查询浏览量
  queryVisitor(type, level, pageNum, pageSize) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/uservisit/findinfo?type=${type}&level=${level}&pageNum=${pageNum}&pageSize=${pageSize}`,
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //  弹框和判断是否团长
  // 判断是否是团长 1不是 2是团长不是第一次进入 3是团长第一次进入
  isLeader() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/leader/judge`,
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //  团长申请表
  leaderApply(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/leader/apply`,
        method: 'post',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //  更新团长状态
  updateStateTuan(id) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/leader/updateState`,
        method: 'post',
        data: {
          id: id
        },
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  //  获取{{shortName}}中心未读消息
  getupdateviwe() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/updateviwe`,
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //  首页代金券弹框
  isVoucher() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `event-coupon/judge`,
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 领取代金券
  getVoucher(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `event-coupon/add`,
        method: 'post',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //  {{shortName}}中心查询可提现金额
  queryTiMoney() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/userincomerecord/findbyrecord`,
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  //  {{shortName}}中心提现
  goTiMoney(amount, type) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/userincomerecord/incomerecordmoney?amount=${amount}&type=${type}`,
        method: 'get',
        // data:data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 查询名片
  queryNameCard() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/ismingpai`,
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //  获取团队微信二维码(申请入群通道)
  getleveltuan(type) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/userstore/leveltuan?level=${type}`,
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  //添加关注
  getAddFans(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'user/userfans/add',
        method: 'get',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  //取消关注
  cancelFans(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'user/userfans/cancel',
        method: 'get',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 店铺名片信息
  qureyer() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: 'user/userstore/qureyer',
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 推广订单 状态:1未结算/2已结算/3已付款/4已失效 0 全部
  queryPromotiondetail(query) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/userpromotiondetail/findstatedetail?status=${query.status}&page=${query.page}&pageSize=${query.pageSize}`,
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //代金券列表
  queryOrderGain(i) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/findbycoupon?type=${i}`,
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  // 贵就赔
  getXzCenterGjpClass(storeId, type) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        //  type 200 (小主学院) 100 （贵就赔）
        url: `content/u/article/class/get?&type=100&column=id,name,icon`,
        method: 'get',
        type: 'go',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //  个人中心分类请求
  getXzCenterClass(storeId, type) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        //  type 200 (小主学院) 100 （贵就赔）
        url: `content/u/article/class/get?&type=200&column=id,name,icon`,
        method: 'get',
        type: 'go',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 小主中心里面通过(大标题返回的id) 获取二级分类
  getXzCenterTwoClass(parentId) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `content/u/article/class/list?&sortOrder=sortId&sortBy=DESC&column=id,name,icon&parentId=${parentId}`,
        method: 'get',
        type: 'go',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 获取文章标题
  getArticleList(classId) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `content/u/article/list?classId=${classId}&sortOrder=sortId&sortBy=DESC&column=id,title,body`,
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 获取单个文章
  getArticleOne(id) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `content/u/article/get?id=${id}&column=id,title,body`,
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 评论商品
  gobuyordercomment(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/buyordercomment/add`,
        method: 'post',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 确认订单
  okOrder(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `order/confirmOrder`,
        method: 'post',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //  预存扣除
  getDepositDetail(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/deductList`,
        method: 'get',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //  预存款收入
  getDeductList(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/depositdetail/find`,
        method: 'get',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //  获取申请退款的商品信息
  getRefund(orderId) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `order/refund/getRefund?orderId=${orderId}`,
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 提交退款原因
  goRefundApply(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `order/refund/refundApply`,
        method: 'post',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //  售后列表
  getRefundOrderList(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `order/refund/refundOrderList`,
        method: 'get',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 退款进度详情
  getRefundDetails(id) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `order/refund/refundDetails?id=${id}`,
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 撤销申请
  cancelRefund(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `order/refund/cancel`,
        method: 'post',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //同意退货
  agreeRefund(id) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `order/refund/getOrderExpress?id=${id}`,
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 修改申请退款详情
  updateRefundDetails(id) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `order/refund/updateRefundDetails?id=${id}`,
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //提交快递单号
  submitRefund(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `order/refund/orderExpress`,
        method: 'post',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 修改退款申请
  updateRefund(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `order/refund/updateRefund`,
        method: 'post',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //退款
  returMoney(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `order/refund/refundPlan`,
        method: 'get',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //获取团购店铺标题
  getGroupShopTitle(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: "user/userstore/findbyuserstoretype",
        method: 'get',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //  搜索列表
  getSearchList(query) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `goods/searchGoodInfo?goodsName=${query.goodsName}&priceSort=${query.priceSort}&salesSort=${query.salesSort}&pageNum=${query.pageNum}&pageSize=${query.pageSize}`,
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  getShareInfo() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `item/u/store/get?column=share_title,share_pic,shareGroup,groupImg&id=${siteinfo.subDomain}`,
        type: 'go',
        method: 'get',
        success: res => {
          resolve(res)
          // if (res.data.data.shareGroup) {
          // this.timout = setTimeout(() => {
          //   clearTimeout(this.timout);
          //   Service.downLoadPoster(res.data.data.shareGroup)
          // }, 1000);
          // }
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //  获取累计消费明细
  getFindbymoney(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/prepaymentdetail/findbymoney`,
        method: 'get',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //  佣金收益
  getTncomeSummarizing() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/userincomerecord/incomeSummarizing`,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  // 获取物流（可能多家）
  getExpress(orderId) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `item/u/express/list?orderId=${orderId}&column=id,orderId,expressCode,expressId,amount,sendTime,expressCompany,status,updateTime`,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 获取快递进程
  getExpressDetail(expressid) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `express/buy_order/get?id=${expressid}`,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //检查是否免费领取过礼品
  checkFree() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/findFeeGiftUsed`,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  // 预存款详情
  getSaveMoneyDetatil(id, type) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/findDepositDetailByIdAndType?id=${id}&type=${type}`,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 推广列表中的详情
  getUserPromotionDetail(id) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/userpromotiondetail?id=${id}`,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //  佣金收益详情 、
  getYongMeney(id, type) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/userIncomeDetail/incomeDetailByIdAndType?id=${id}&type=${type}`,
        method: 'get',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //获取权益内容
  getPower(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `content/u/rights/get`,
        method: 'get',
        data: data,
        type: 'go',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  //浏览
  browse(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/uservisit/findadd`,
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 累计消费详情
  getConsumeDetail(id) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/expenseDetail?id=${id}`,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 预存款是否低于 10%
  getCheckDeposit() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/checkDeposit`,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  // 订单提示
  getOrderStatistics() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `order/orderStatistics`,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 小主收益循环滚动数据
  getEelectIncomeSort() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `order/u/commission/selectIncomeSort`,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  getWithdrawProgressList() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `/order/u/selectTransferOntheWay`,
        method: 'GET',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 创小主头条
  getHeadNews() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `order/u/selectAllNews`,
        method: 'GET',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 店铺街
  getStoreStreetList(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/leader/storeStreet`,
        method: 'GET',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 店铺街里面的店铺详情
  getOne(id) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/leader/getOne?id=${id}`,
        method: 'GET',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 判断店铺存不存在  //0 上架 1下架 2 为空 3 待审核 审核不通过为2
  getleaderExist(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/leader/getleaderExist`,
        method: 'GET',
        data: data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // 查询店铺申请回显的数据
  getleader() {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/leader/getleader`,
        method: 'GET',
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  getSales(data) {
    return new Promise((resolve, reject) => {
      CommonService.request({
        url: `user/leader/storeCount`,
        method: 'GET',
        data,
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  }

}