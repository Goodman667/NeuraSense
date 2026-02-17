App({
  onLaunch() {
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
    }
  },

  globalData: {
    token: '',
    userInfo: null,
    apiBase: 'https://api.neurasense.cc/api/v1',
    webBase: 'https://neurasense.cc',
  },
});
