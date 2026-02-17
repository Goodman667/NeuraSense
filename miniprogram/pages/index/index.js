const app = getApp();

Page({
  data: {
    url: '',
  },

  onLoad() {
    const token = app.globalData.token;
    if (!token) {
      wx.redirectTo({ url: '/pages/loading/loading' });
      return;
    }

    const base = app.globalData.webBase;
    const url = `${base}?token=${encodeURIComponent(token)}&from=miniprogram`;
    this.setData({ url });
  },

  onMessage(e) {
    // 接收 web-view 内页面通过 postMessage 发来的消息
    const data = e.detail.data;
    if (data && data.length > 0) {
      const msg = data[data.length - 1];
      if (msg.action === 'logout') {
        wx.removeStorageSync('token');
        app.globalData.token = '';
        wx.redirectTo({ url: '/pages/loading/loading' });
      }
    }
  },
});
