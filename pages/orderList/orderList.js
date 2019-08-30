// pages/orderList/orderList.js
import wxRepuest from '../../utils/wxrq.js';
import Order from '../../model/order.js';
import PreOrder from '../../model/preOrder.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ossUrl: '',
    tabList: ['全部', '待付款', '待发货', '待收货', '待评价'],
    emptylistShow: true, //  列表为空
    currentIdx: 0,
    operations: [], // 按钮列表
    orderList: [],
    more: false,
  },
  // 切换tab
  swichTab(e) {
    let idx = e.currentTarget.dataset.idx; // 传入的需要是数字
    this.setData({
      more: false,
      currentIdx: idx,
      orderList: [],
      emptylistShow: true,

    })
    if(!this.flag){
      this.orderClassSwitch(idx)
    }
    

  },

  // 进入商品详情
  goOrderDetail(e) {
    if (e.currentTarget.dataset.key) return;
    let id = e.currentTarget.dataset.id // 订单状态
    wx.navigateTo({
      url: `/pages/orderDetail/orderDetail?id=${id}`,
      success: res => {
        this.gode = true; //记录返回本页面的时候 刷新页面
      }
    })
  },
  // 选择操作  
  operItem(e) {
    let key = e.currentTarget.dataset.key * 1;
    let idx = e.currentTarget.dataset.idx;
    let order = e.currentTarget.dataset.order;

    switch (key) {
      case 1:
        break;
      case 2: //取消订单

        wx.navigateTo({
          url: `/pages/cancel_order/cancel_order?orderId=${order}`,
          success: res => {
            this.gode = true; //记录返回本页面的时候 刷新页面
          }
        })
        break;
      case 3: //支付
        this.goPay(idx);
        break;
      case 4: //4查看取货码
        wx.navigateTo({
          url: `/pages/orderDetail/orderDetail?id=${order}`,
          success: res => {
            this.gode = true; //记录返回本页面的时候 刷新页面
          }
        })
        break;
      case 5: //5确认收货
        wx.showModal({
          title: '提示',
          content: '确认已经收到快递？',
          success: res => {
            if (res.confirm) {
              wxRepuest.okOrder(
                order
              ).then(res => {
                this.setData({
                  orderList: []
                })
                this.orderClassSwitch(this.data.currentIdx);
                this.gode = false;
              }).catch(err => {
                console.error(err);
              })
            }
          }
        })
        break;
      case 6: //6查看物流
        wx.navigateTo({
          url: `/pages/look_logistics/look_logistics?orderId=${order}`,
        })
        break;
      case 7: //7去评价
        Order.items = this.data.orderList[idx].items;
        wx.navigateTo({
          url: `/pages/go_comment/go_comment?orderId=${order}`,
          success: res => {
            this.gode = true; //记录返回本页面的时候 刷新页面
          }
        })
        break;
      case 8: //8再次购买
        this.againShop(idx)
        break;
      case 9: //9删除订单
        wx.showModal({
          title: '提示',
          content: '删除订单后，订单信息将从您的订单列表移除',
          success: (res) => {
            if (res.confirm) {
              this.deleteOrder(order);
            }
          }
        })
        break;
    }
  },
  // 删除订单
  deleteOrder(id) {
    wxRepuest.deleteOrder({
      id: id
    }).then(res => {
      wx.showToast({
        title: '删除成功',
        icon: 'none'
      })
      this.page = 1;
      this.totalPage = null;
      this.getList(this.data.currentIdx)
      this.setData({
        orderList: []
      })

    }).catch(err => {
      console.error(err)
    })
  },
  //再次购买
  againShop(idx) {
    // wx.showToast({
    //   title: '暂不能购买',
    //   icon: 'none'
    // })
    // return;
    let value = this.data.orderList[idx];
    let items = [];
    for (let i = 0; i < value.items.length; i++) {
      items.push({
        count: value.items[i].num,
        eventType: value.eventType || 1,
        skuId: value.items[i].skuId,
        spuId: value.items[i].spuId,
      })
    }

    let data = {
      cart: value.items.length > 1 ? true : false,
      userStores: [{
        gainUserId: value.gainUserId || '',
        items: items,
        userStoreId: value.userStoreId || '',
        userStoreName: value.userStoreName || '',
        userStoreType: value.userStoreType || 1
      }]
    }

    wxRepuest.submitPreOrder(data).then(res => {
      PreOrder.preOrder = res.data.data;
      wx.navigateTo({
        url: `/pages/order_confirm/order_confirm?eventType=${value.items[0].eventType}&payMethod=${value.eventType == 3 ? value.payMethod:''}`,
        success: res => {}
      })
    }).catch(err => {

      console.error(err)
    })
  },
  // 去付款
  goPay(idx) {
    wxRepuest.rePay(
      this.data.orderList[idx].paySn
    ).then(res => {
      wx.navigateTo({
        url: `/pages/order_finishied/order_finishied?orderId=${res.orderId}&price=${(this.data.orderList[idx].amount / 100).toFixed(2)}&eventType=${this.data.orderList[idx].eventType}`,
        success: res => {
          this.gode = true; //记录返回本页面的时候 刷新页面
        }
      })
    }).catch(err => {
      this.setData({
        orderList: []
      })
      this.page = 1;
      this.totalPage = null;
      this.getList(this.data.currentIdx)
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      ossUrl: app.globalData.siteinfo.imgUrl,
    })
    this.orderClassSwitch(options.classId * 1);
  },
  // 获取订单列表
  page: 1,
  totalPage: null,
  getList(classId) {
    this.flag = true
    // 0全部/1待付款/2待发货/3待收货/4待评价
    if (this.totalPage != null && this.totalPage < this.page) {
      this.setData({
        more: true
      })
      return
    }
    wxRepuest.getOrderList({
      page: this.page,
      pageSize: 10,
      type: classId
    }).then((res) => {
      this.flag = false
      this.totalPage || (this.totalPage = Math.ceil(res.data.data.rowCount / 10));
      let newList = this.data.orderList.concat(res.data.data.rows);

      if (newList.length == 0) {
        this.setData({
          emptylistShow: false
        })
      }
      this.setData({
        orderList: newList,
      })

    }).catch((err) => {
      this.setData({
        orderList: this.data.orderList
      })
    })
  },
  //  订单类别切换
  orderClassSwitch(classId) {
    let tit = '';
    switch (classId) {
      case 1:
        tit = '待付款订单';
        break;
      case 2:
        tit = '待发货订单';
        break;
      case 3:
        tit = '待收货订单';
        break;
      case 4:
        tit = '待评价订单';
        break;
      default:
        tit = '订单';

    }

    wx.setNavigationBarTitle({
      title: tit
    });
    this.setData({
      currentIdx: classId
    });
    this.page = 1;
    this.totalPage = null;
    this.getList(classId)
  },
  onShow: function() {
    if (this.gode) {
      this.gode = false;
      this.page = 1
      this.setData({
        orderList: []
      })
      this.page = 1;
      this.totalPage = null;
      this.getList(this.data.currentIdx);
    }
  },
  onReachBottom() {
    this.page++;
    this.getList(this.data.currentIdx)
  },


})