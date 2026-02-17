const app = getApp();

/**
 * 封装 wx.request
 */
function request(url, options = {}) {
  const { method = 'GET', data, header = {} } = options;
  const fullUrl = url.startsWith('http') ? url : `${app.globalData.apiBase}${url}`;

  return new Promise((resolve, reject) => {
    wx.request({
      url: fullUrl,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header,
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(res.data)}`));
        }
      },
      fail(err) {
        reject(err);
      },
    });
  });
}

module.exports = { request };
