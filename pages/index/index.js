Page({
  data: { show: true },
  onLoad() {
    // Destroy the web-view 10 s after load. No message is exchanged with the H5 page.
    setTimeout(() => this.setData({ show: false }), 10000);
  },
});
