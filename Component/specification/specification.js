// Component/specification/specification.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    thumb: {
      type: String,
      value: ''
    },
    stock: {
      type: String || Number,
      value: '0'
    },
    price: { //价格
      type: String || Number,
      value: '0.00'
    },
    attribute: { //属性数组
      type: Array,
      value: null
    },
    currentItem: {
      type: Array,
      value: [0, 0]
    },
    attributeStr: { //属性名称字段名
      type: String,
      value: ''
    },
    attributeArrStr: { //属性数组字段名
      type: String,
      value: ''
    },
    num: { //起始数量
      type: String || Number,
      value: 1
    },
    minNum: { //最小数量
      type: String || Number,
      value: 1
    },
    maxNum: { //最大数量
      type: Object,
      value: {
        num: null,
        txt: '库存不足',
        type: 'stock' // stock 库存  limit 限购
      }
    },

    tableShow: { //面板显示
      type: Boolean,
      value: false
    }

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    addTap(e) {
      if (this.data.maxNum.num != null && (this.data.num * 1) >= (this.data.maxNum.num * 1)) {
        if (this.data.maxNum.txt) {
          wx.showToast({
            title: this.data.maxNum.txt,
            icon: 'none'
          })
        }
        return;
      }
      this.setData({
        num: (this.data.num * 1) + 1
      })
      let myEventDetail = { // detail对象，提供给事件监听函数
        value: {
          num: this.data.num
        }
      }
      let myEventOption = {} // 触发事件的选项
      this.triggerEvent('num', myEventDetail, myEventOption);
    },
    reduceTap(e) {
      if (this.data.num * 1 > 1) {
        this.setData({
          num: (this.data.num * 1) - 1
        })
        let myEventDetail = { // detail对象，提供给事件监听函数
          value: {
            num: this.data.num
          }
        }
        let myEventOption = {} // 触发事件的选项
        this.triggerEvent('num', myEventDetail, myEventOption);
      }
    },
    swichAttribute(e) {
      if (e.target.dataset.type) {
        let attribute = this.data.attribute;
        let index = e.target.dataset.index * 1 >= 0 ? e.target.dataset.index * 1 : this.data.currentItem[0];
        let idx = e.target.dataset.idx * 1 >= 0 ? e.target.dataset.idx * 1 : (attribute[this.data.currentItem[0]].sku.length < (this.data.currentItem[1] + 1) ? 0 : this.data.currentItem[1]);

        let skuLen = attribute[index].sku.length;
        idx > (skuLen - 1) && (idx = skuLen - 1);
        this.setData({
          currentItem: [index, idx]
        })

        let myEventDetail = { // detail对象，提供给事件监听函数
          value: {
            spuId: attribute[index].id,
            id: attribute[index].sku[idx].id,
            attr: `${attribute[index].spuName} ${attribute[index].sku[idx].skuName}`,
            num: this.data.num,
            price: attribute[index].sku[idx].price,
            unit: attribute[index].sku[idx].unit, //该套装数目
            marketPrice: attribute[index].marketPrice,
            stock: attribute[index].stock || 0, // Math.floor(attribute[index].stock / attribute[index].sku[idx].unit),
            salesCount: attribute[index].salesCount || 0 // Math.floor((attribute[index].salesCount || 0) / attribute[index].sku[idx].unit)
          }
        }
        let myEventOption = {} // 触发事件的选项
        this.triggerEvent('swich', myEventDetail, myEventOption);
      }
    },
    confirmTap(e) {
      this.setData({
        tableShow: false
      })
      let attribute = this.data.attribute;
      let index = this.data.currentItem[0];
      let idx = this.data.currentItem[1];
      let myEventDetail = { // detail对象，提供给事件监听函数
        value: {
          spuId: attribute[index].id,
          id: attribute[index].sku[idx].id,
          attr: `${attribute[index].spuName}`,
          num: this.data.num
        }
      }
      let myEventOption = {} // 触发事件的选项
      this.triggerEvent('confirm', myEventDetail, myEventOption);
    },

    closeTap(e) {
      this.setData({
        tableShow: false
      })
      let myEventDetail = {};
      let myEventOption = {};
      this.triggerEvent('close', myEventDetail, myEventOption);
    }
  }
})