// pages/apply_form/apply_form.js
import WXRQ from '../../utils/wxrq.js';
import Service from '../../utils/service.js';
import oss from '../../utils/oss.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    echoData: {},
    list: [{
      id: 1,
      name: '自由职业'
    }, {
      id: 2,
      name: '全职太太'
    }, {
      id: 3,
      name: '普通学生'
    }, {
      id: 4,
      name: '上班白领'
    }, {
      id: 5,
      name: '其他'
    }],
    list_1: [{
      id: 1,
      name: '美甲'
    }, {
      id: 2,
      name: '母婴'
    }, {
      id: 3,
      name: '水果生鲜'
    }, {
      id: 4,
      name: '服装'
    }, {
      id: 5,
      name: '美容美体'
    }, {
      id: 6,
      name: '瑜伽馆'
    }, {
      id: 7,
      name: '舞蹈室'
    }, {
      id: 8,
      name: '休闲零食'
    }, {
      id: 9,
      name: '其他'
    }],
    currentId: 1,
    currentId_1: 1,
    items: [{
        // name: 'YES',
        name: 1,
        value: '是'
      },
      {
        // name: 'NO',
        name: 0,
        value: '否',
      },
    ],
    showQt: false,
    showType: false,
    isChoose: false,
    currentId_2: 0,
    previePhoto: '', // 营业执照
    isAgree: true // 同意btn
  },

  selectAlone(e) {
    // 1.自由职业 2.全职太太 3.普通学生 4.上班白领 5.其他 
    if (e.target.dataset.id) {
      this.setData({
        currentId: e.target.dataset.id || 0
      })
    }
  },

  selectAlone_1(e) {
    if (e.target.dataset.id) {
      this.setData({
        currentId_1: e.target.dataset.id || 0
      })
    }
    if (e.target.dataset.id == 9) {
      this.setData({
        showQt: true
      })
    } else {
      this.setData({
        showQt: false
      })
    }
  },

  radioChange(e) {
    console.log('是否有实体店：', e.detail.value)
    this.setData({
      isChoose: true
    })
    if (e.detail.value == 0) {
      this.setData({
        showType: false,
        currentId_2: 0
      })
    } else {
      this.setData({
        showType: true,
        currentId_2: 1
      })
    }
  },

  submitForm(e) {
    // if (this.abc) return;
    // this.abc = true;
    if (this.formed) {
      wx.showToast({
        title: '请勿重复提交申请,请耐心等待审核通过',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    let value = e.detail.value;

    if (!value.name) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none',
        duration: 2000
      })
      return;
    } else if (value.address <= 5) {
      wx.showToast({
        title: '请输入有效地址',
        icon: 'none',
        duration: 2000
      })
      return;
    } else if (!(/^1[34578]\d{9}$/.test(value[`mobile`]))) {
      wx.showToast({
        title: '请输入有效手机号',
        icon: 'none',
        duration: 2000
      })
      return;
    } else if (this.data.isChoose == false) {
      wx.showToast({
        title: '请选择是否有实体店',
        icon: 'none',
        duration: 2000
      })
      return;
    } else if (this.data.isChoose == true && this.data.showQt == true) {
      if (!value.storeType) {
        wx.showToast({
          title: '请填写实体店类型',
          icon: 'none',
          duration: 2000
        })
        return;
      }
    }
    if (this.tuanStatus == 1){
      value.id = this.data.echoData.id
    }
    value.occupation = this.data.currentId;
    value.storeState = this.data.currentId_2;
    value.businessLicense = this.data.previePhoto
    value.invitationId = this.fuid || wx.getStorageSync('uid')

    if (value.storeType == '') {
      value.storeType = '美甲'
    }
    switch (this.data.currentId_1) {
      case 1:
        value.storeType = '美甲'
        break;
      case 2:
        value.storeType = '母婴'
        break;
      case 3:
        value.storeType = '水果生鲜'
        break;
      case 4:
        value.storeType = '服装'
        break;
      case 5:
        value.storeType = '美容美体'
        break;
      case 6:
        value.storeType = '瑜伽馆'
        break;
      case 7:
        value.storeType = '舞蹈室'
        break;
      case 8:
        value.storeType = '休闲零食'
        break;
      case 9:
        value.storeType = value.storeType
        break;
    }
    //-------------
    if (this.data.showType) {
      if (!value.storeName) {
        wx.showToast({
          title: '请输入店铺名称',
          icon: 'none',
          duration: 2000
        })
        return
      }
      if (!value.shopIntroduce) {
        wx.showToast({
          title: '请输入店铺简介',
          icon: 'none',
          duration: 2000
        })
        return
      }
      if (!value.businessLicense) {
        wx.showToast({
          title: '请上传营业执照',
          icon: 'none',
          duration: 2000
        })
        return
      }
    }


    //-------------
    if (!this.data.isAgree) {
      wx.showToast({
        title: '请选择已阅读了解',
        icon: 'none',
        duration: 2000
      })
      return
    }
    console.log('编辑的数据：',value)
    WXRQ.leaderApply(value).then(res => {
      // this.abc = null;
      this.formed = true;
      wx.showModal({
        title: '提示',
        content: '申请已提交，请等待客服审核',
        success: function() {
          wx.switchTab({
            url: '/pages/index/index',
          })
        }
      })
    }).catch(err => {
      console.error(err)
    })
  },

  // 上传执照图片
  upCardphoto() {
    let That = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePaths = res.tempFilePaths[0]
        oss.getOssData({
          type: 7,
          ID: wx.getStorageSync('uid')
        }).then((ossData) => {

          oss.upPicFile(ossData.ossUrl, ossData.ossObj, [tempFilePaths]).then((ossUrlArr) => {
            console.log('ossUrl:', ossUrlArr)
            That.setData({
              previePhoto: ossUrlArr[0],
            })

          })
        })
        // -----------------------
      }
    })
  },
  agreebtn() {
    this.setData({
      isAgree: !this.data.isAgree
    })
  },
  onLoad(options) {
    this.tuanStatus = options.tuanStatus
    if (this.tuanStatus == 1) {
      WXRQ.getleader().then(res => {
        this.setData({
          echoData: res.data.data || {},
          previePhoto: (res.data.data && res.data.data.businessLicense )|| ''
        })
      })
    }
    options.fuid && (this.fuid = options.fuid)
    this.setData({
      ossUrl: app.globalData.siteinfo.imgUrl
    })

  }
})