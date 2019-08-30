export default {
  audio: null,
  audioPlay(src, loop) {
    if (src) {
      this.audio && this.audio.destroy();
      let audio = wx.createInnerAudioContext();
      audio.src = src;
      audio.autoplay = true;
      this.audio = audio;
      if (loop) {
        this.audio.loop = true
      } else {
        this.audio.onEnded(this.audioEnd = () => {
          this.audio.offEnded(this.audioEnd);
          this.audio && this.audio.destroy();
        })
      }
    }
  },
  audioDestroy() {
    this.audio && this.audio.destroy();
  },

  audioPause() {
    this.audio && this.audio.pause();
  },

  audioStop() {
    this.audio && this.audio.stop();
  },

  audioContinue() {
    this.audio && this.audio.play()
  }
}