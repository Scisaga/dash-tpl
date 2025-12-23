/**
 * 用户管理页面组件
 * 负责用户列表的展示、筛选和状态管理
 */
function usersPage() {
  return {
    // 用户列表数据
    users: [],
    // 筛选条件
    filters: {
      keyword: '',
      status: ''
    },
    loading: false,
    page: 1,
    perPage: 20,
    hasMore: true,

    /**
     * 初始化页面
     * 设置筛选器监听和无限滚动
     */
    async init() {
      this.watchFilters();
      await this.loadMore();

      this.$nextTick(() => {
        const observer = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting) this.loadMore();
        });
        observer.observe(this.$refs.sentinel);
      });
    },

    /**
     * 监听筛选条件变化
     */
    watchFilters() {
      this.$watch('filters.keyword', () => this.resetAndFetch());
      this.$watch('filters.status', () => this.resetAndFetch());
    },

    /**
     * 重置分页并重新获取数据
     */
    async resetAndFetch() {
      this.page = 1;
      this.users = [];
      this.hasMore = true;
      await this.loadMore();
    },

    /**
     * 加载更多用户数据
     */
    async loadMore() {
      if (!this.hasMore || this.loading) return;
      this.loading = true;

      const newUsers = await window.fetchUserList(this.filters, this.page, this.perPage);
      this.users.push(...newUsers);
      this.page++;
      if (newUsers.length < this.perPage) this.hasMore = false;

      this.loading = false;
    },

    /**
     * 切换用户状态（启用/禁用）
     * @param {Object} user - 用户对象
     */
    toggleUserStatus(user) {
      user.status = user.status === 'active' ? 'in_active' : 'active';
    }
  };
}
