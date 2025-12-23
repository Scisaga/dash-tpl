/**
 * 仪表盘主组件
 * 提供整体布局、路由管理、时间更新和状态显示功能
 * @module components/dashboard
 */

function dashboard() {
  return {
    timeFull: '',      // 完整时间显示
    currentHash: '',   // 当前路由 hash
    menuItems: [
      { label: '模板列表', icon: 'hub', route: '#templates' },
      { label: '工作流列表', icon: 'flowchart', route: '#workflow' },
      { label: '用户列表', icon: 'group', route: '#users' },
      { label: '示例页面', icon: 'lightbulb', route: '#content-page' },
    ],
    userName: '访客', // 用户名，默认值为“访客”
    /**
     * 更新时间显示
     * 使用中文格式显示当前时间
     */
    updateTime() {
      const now = new Date();
      this.timeFull = now.toLocaleString('zh-CN');
    },

    /**
     * 加载页面内容
     * 根据路由 hash 加载对应的 HTML 页面
     * @param {string} hash - 路由 hash 值
     */
    async loadContent(hash) {
      this.currentHash = hash;

      const view = hash.replace('#', '');
      const res = await fetch(`pages/${view}.html`);
      const html = await res.text();

      // 先清空再插入 DOM 元素
      this.$refs.mainContainer.innerHTML = '';

      console.log(`🔥 插入 ${view}.html 内容`);
      const tmp = document.createElement('div');
      tmp.innerHTML = html;

      // 只插入子元素，避免外层结构被破坏
      [...tmp.children].forEach(child => {
        this.$refs.mainContainer.appendChild(child);
      });

      console.log('🧠 调用 Alpine.initTree');
      Alpine.initTree(this.$refs.mainContainer);
    },

    /**
     * 处理路由变化
     * 当 hash 变化时重新加载页面内容
     */
    handleRouteChange() {
      const hash = location.hash || '#workflow';
      this.loadContent(hash);
    },

    /**
     * 初始化函数
     * 设置时间更新定时器
     * 初始化路由
     * 监听路由变化
     */
    init() {
      this.updateTime();
      setInterval(() => this.updateTime(), 1000);
      this.handleRouteChange();
      window.addEventListener('hashchange', () => this.handleRouteChange());
    }
  };
}
