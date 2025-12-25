/**
 * 仪表盘主组件
 * 提供整体布局、路由管理、时间更新和状态显示功能
 * @module components/dashboard
 */

function dashboard() {
  return {
    timeFull: '',      // 完整时间显示
    routerMode: 'hash', // 路由模式：hash | history
    baseUrl: '/',       // History 模式下的基准路径（末尾带 /）
    defaultView: 'workflow',
    currentView: '',
    menuItems: [
      { label: '模板列表', icon: 'hub', view: 'templates' },
      { label: '工作流列表', icon: 'flowchart', view: 'workflow' },
      { label: '用户列表', icon: 'group', view: 'users' },
      { label: '示例页面', icon: 'lightbulb', view: 'content-page' },
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
     * 解析配置的路由模式（默认 hash）
     */
    getConfiguredRouterMode() {
      const modeAttr = document.documentElement?.dataset?.router?.trim();
      if (modeAttr === 'history' || modeAttr === 'hash') return modeAttr;

      const urlMode = new URLSearchParams(location.search).get('router');
      if (urlMode === 'history' || urlMode === 'hash') return urlMode;

      return 'hash';
    },

    /**
     * 计算 History 模式下的 baseUrl
     * 可通过 <html data-base="/admin/"> 显式指定
     */
    computeBaseUrl() {
      const baseAttr = document.documentElement?.dataset?.base?.trim();
      if (baseAttr) {
        const resolved = new URL(baseAttr, window.location.href);
        const pathname = resolved.pathname.endsWith('/') ? resolved.pathname : `${resolved.pathname}/`;
        return pathname;
      }

      // 从当前路径推断：把最后一段当作 view，剩余作为 baseUrl
      let pathname = new URL(window.location.href).pathname;
      pathname = pathname.replace(/\/+$/, '');
      if (pathname === '') pathname = '/';

      const last = pathname.split('/').filter(Boolean).pop();
      if (!last || last.endsWith('.html')) return pathname === '/' ? '/' : `${pathname}/`;

      const base = pathname.replace(/\/[^/]+$/, '');
      return base === '' ? '/' : `${base}/`;
    },

    getViewFromHash(hash) {
      const raw = (hash || '').trim();
      if (!raw || raw === '#') return '';
      return raw.startsWith('#') ? raw.slice(1) : raw;
    },

    getViewFromPath(pathname) {
      const basePrefix = this.baseUrl === '/' ? '' : this.baseUrl.replace(/\/$/, '');
      let relative = (pathname || '/').trim();
      if (basePrefix && relative.startsWith(basePrefix)) relative = relative.slice(basePrefix.length);

      const cleaned = relative.replace(/^\/+/, '').replace(/\/+$/, '');
      const view = cleaned.split('/').filter(Boolean)[0] || '';
      return view || this.defaultView;
    },

    /**
     * 根据当前路由模式生成 href（用于复制/新标签打开）
     */
    hrefFor(view) {
      const safeView = (view || '').trim() || this.defaultView;
      if (this.routerMode === 'history') return `${this.baseUrl}${safeView}`;
      return `#${safeView}`;
    },

    /**
     * 跳转到指定 view（hash 或 History API）
     */
    navigate(view, { replace = false } = {}) {
      const safeView = (view || '').trim() || this.defaultView;

      if (this.routerMode === 'history') {
        const url = this.hrefFor(safeView);
        if (replace) history.replaceState(null, '', url);
        else history.pushState(null, '', url);
        this.handleRouteChange();
        return;
      }

      const nextHash = this.hrefFor(safeView);
      if (location.hash === nextHash) this.handleRouteChange();
      else location.hash = nextHash;
    },

    /**
     * 加载页面内容
     * @param {string} view - 页面 view（对应 pages/<view>.html）
     */
    async loadView(view) {
      this.currentView = view;

      const res = await fetch(`pages/${view}.html`);
      const html = await res.text();

      // 先清空再插入 DOM 元素
      this.$refs.mainContainer.innerHTML = '';

      console.log(`插入 ${view}.html 内容`);
      const tmp = document.createElement('div');
      tmp.innerHTML = html;

      // 只插入子元素，避免外层结构被破坏
      [...tmp.children].forEach(child => {
        this.$refs.mainContainer.appendChild(child);
      });

      console.log('调用 Alpine.initTree');
      Alpine.initTree(this.$refs.mainContainer);
    },

    /**
     * 处理路由变化
     * 当 hash 或 popstate 变化时重新加载页面内容
     */
    handleRouteChange() {
      if (this.routerMode === 'history') {
        // 兼容旧的 hash 链接/跳转：自动转换成 History URL，并清理 hash
        const hashView = this.getViewFromHash(location.hash);
        if (hashView) {
          const url = this.hrefFor(hashView);
          history.replaceState(null, '', url);
          this.loadView(hashView);
          return;
        }

        const view = this.getViewFromPath(location.pathname);
        this.loadView(view);
        return;
      }

      const view = this.getViewFromHash(location.hash) || this.defaultView;
      this.loadView(view);
    },

    /**
     * 初始化函数
     * 设置时间更新定时器
     * 初始化路由
     * 监听路由变化
     */
    init() {
      this.routerMode = this.getConfiguredRouterMode();
      if (this.routerMode === 'history') this.baseUrl = this.computeBaseUrl();

      this.updateTime();
      setInterval(() => this.updateTime(), 1000);
      this.handleRouteChange();
      window.addEventListener('hashchange', () => this.handleRouteChange());
      if (this.routerMode === 'history') {
        window.addEventListener('popstate', () => this.handleRouteChange());
      }
    }
  };
}
