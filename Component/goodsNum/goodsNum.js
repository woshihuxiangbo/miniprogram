// component/goodsNum/goodsNum.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    disabled: {
      type: Boolean,
      value: false
    },
    color: {
      type: String,
      value: '#333'
    },
    startNum: {
      type: Number,
      value: 1
    },
    maxNum: {
      type: Object,
      value: {
        num: null,
        txt: '库存不足'
      }
    },

    minNum: {
      type: Number,
      value: null
    },
    markHidden: {
      type: Boolean,
      value: false
    }
  },
  /**外部样式类 */
  externalClasses: ['whole-class', 'left-class', 'center-class', 'right-class'],
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    reduceTap(e) {
      if (this.data.startNum * 1 <= 0 || (this.data.minNum && this.data.startNum * 1 <= this.data.minNum)) return;
      let num = this.data.startNum * 1 - 1;
      let myEventDetail = { // detail对象，提供给事件监听函数
        value: num
      }
      let myEventOption = {} // 触发事件的选项
      this.triggerEvent('change', myEventDetail, myEventOption);
      num = null;
      myEventDetail = null;
      myEventOption = null;
    },
    addTap(e) {
      if (this.data.maxNum.num != null && this.data.startNum * 1 >= this.data.maxNum.num * 1) {
        if (this.data.maxNum.txt) {
          wx.showToast({
            title: this.data.maxNum.txt,
            icon: 'none'
          })
        }
        return;
      };
      let num = this.data.startNum * 1 + 1;
      let myEventDetail = { // detail对象，提供给事件监听函数
        value: num
      }
      let myEventOption = {} // 触发事件的选项
      this.triggerEvent('change', myEventDetail, myEventOption);
      num = null;
      myEventDetail = null;
      myEventOption = null;
    }
  }
})