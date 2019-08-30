
import clipData from '../../model/clipUrlArr.js';
Component({
  data: {
    picArr: [],
    picUpBtn: true,
  },
  properties: {
    currentKey: { // 最多3张
      type: Number || String,
      value: 3
    },
    title: {
      type: String,
      value: '上传图片'
    },
    url:{
      type: String,
      value:'',
    },
  },
  ready(){
    // console.log('bigup组件:', clipData.clipUrlArr)
    this.setData({
      picArr: clipData.clipUrlArr
    })
    if (clipData.clipUrlArr.length == 2){
      this.setData({
        picUpBtn:false
      })
    }
  },
  methods: {
    closeThisPic(data){
      let currentIndex = data.currentTarget.dataset.index
      this.triggerEvent('closeThisPic', currentIndex);
    },
    // 添加预览图片
    upPicture() {
      let _that = this;
      wx.chooseImage({
        sizeType: 'compressed',
        count: 1,
        success(res) {
          let tempPicUrl = res.tempFilePaths[0];
     
          // let photoArr = _that.data.picArr;
          // if (photoArr.length < 3) {
          //   photoArr.push(tempPicUrl)
          //   _that.setData({
          //     picArr: photoArr
          //   })
          _that.triggerEvent('upbgi', tempPicUrl);
          // if (clipUrlArr.length == 2) {
              
          //     _that.setData({
          //       picUpBtn: !_that.data.picUpBtn
          //     })
          //   }
          // }

          // _that.triggerEvent('picChange', _that.data.picArr);
          
        }
      })
    },
    // 删除当前照片
    closePic(e) {
      let key = e.currentTarget.dataset.key;
      let tempArr = this.data.picArr;
      tempArr.splice(key, 1);
      // console.log('删除后：', clipData.clipUrlArr)
      this.setData({
        picArr: tempArr
      });
      if (this.data.picArr.length != 2) {
        this.setData({
          picUpBtn: true
        })
      }
      this.triggerEvent('picChange', this.data.picArr);
    }
  }
})