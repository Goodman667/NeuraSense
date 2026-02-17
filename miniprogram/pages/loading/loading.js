const { request } = require('../../utils/request');
const app = getApp();

Page({
  data: {
    statusText: '正在登录...',
    error: '',
  },

  onLoad() {
    this.doLogin();
  },

  async doLogin() {
    this.setData({ error: '', statusText: '正在登录...' });

    try {
      // 1. 检查缓存的 token
      const cachedToken = wx.getStorageSync('token');
      if (cachedToken) {
        app.globalData.token = cachedToken;
        this.setData({ statusText: '加载中...' });
        this.navigateToMain();
        return;
      }

      // 2. 调用 wx.login 获取 code
      this.setData({ statusText: '微信授权中...' });
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject,
        });
      });

      if (!loginRes.code) {
        throw new Error('微信登录失败，未获取到 code');
      }

      // 3. 发送 code 到后端换取 token
      this.setData({ statusText: '登录中...' });
      const data = await request('/auth/mp/login', {
        method: 'POST',
        data: { code: loginRes.code },
      });

      // 4. 保存 token
      const token = data.token;
      if (!token) {
        throw new Error('服务器未返回 token');
      }

      wx.setStorageSync('token', token);
      app.globalData.token = token;
      app.globalData.userInfo = {
        user_id: data.user_id,
        is_new: data.is_new,
      };

      // 5. 跳转主页
      this.setData({ statusText: '加载中...' });
      this.navigateToMain();
    } catch (err) {
      console.error('登录失败:', err);
      this.setData({
        error: err.message || '登录失败，请重试',
      });
    }
  },

  navigateToMain() {
    wx.redirectTo({
      url: '/pages/index/index',
    });
  },

  handleRetry() {
    this.doLogin();
  },
});
