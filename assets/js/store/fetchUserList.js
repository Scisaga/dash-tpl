/**
 * 用户列表数据获取模块
 * 提供用户列表的模拟数据获取功能，支持分页和筛选
 * @module store/fetchUserList
 */

/**
 * 获取用户列表数据
 * @param {Object} filters - 筛选条件
 * @param {string} [filters.keyword] - 关键词搜索
 * @param {string} [filters.status] - 用户状态筛选
 * @param {number} [page=1] - 页码
 * @param {number} [perPage=20] - 每页数量
 * @returns {Promise<Array>} 用户列表数据
 */
window.fetchUserList = async function(filters = {}, page = 1, perPage = 20) {

  await new Promise(r => setTimeout(r, 300)); // 模拟延迟

  const dummyData = Array.from({ length: perPage }, (_, i) => {
    
    const id = (page - 1) * perPage + i + 1;
    const username = `user${id}`;
    const nickname = `用户${id}`;
    const email = `user${id}@example.com`;

    const roles = Math.random() < 0.2 ? 'system_user system_admin' : 'system_user';
    const status = Math.random() > 0.1 ? 'active' : 'in_active'; // 供状态筛选和切换使用
    const create_at = Date.now() - Math.floor(Math.random() * 100 * 86400 * 1000); // 最近100天内

    // avatar 字段缺失时，页面会使用纯色块占位
    return { id, username, nickname, email, roles, status, create_at };
  });

  return dummyData.filter(user => {
    const matchKeyword = filters.keyword
      ? user.username.toLowerCase().includes(filters.keyword.toLowerCase())
      : true;

    const matchStatus = filters.status
      ? user.status === filters.status
      : true;

    return matchKeyword && matchStatus;
  });
};
