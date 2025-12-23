/**
 * 模板列表数据获取模块
 * 提供工作流模板列表的模拟数据获取功能，支持分页、筛选和排序
 * @module store/fetchTemplateList
 */

/**
 * 获取模板列表数据
 * @param {Object} filters - 筛选条件
 * @param {string} [filters.keyword] - 关键词搜索
 * @param {string[]} [filters.tags] - 标签筛选
 * @param {string} [filters.sort] - 排序方式（'updated' 或 'starred'）
 * @param {number} [page=1] - 页码
 * @param {number} [perPage=10] - 每页数量
 * @returns {Promise<Array>} 模板列表数据
 */
window.fetchTemplateList = async function(filters = {}, page = 1, perPage = 10) {
  await new Promise(r => setTimeout(r, 400));

  const titles = [
    '多端履约状态看板', '工业数据采集分析', '全链路质检流程',
    '跨组织审批流协作', '智慧物流调度引擎', '运营数据可视化大屏',
    '客户接触路径追踪', '作业风险自动识别流程', '设备运维周期预测', '无人值守任务机器人'
  ];

  const descriptions = [
    '展示任务的执行状态、处理进度与异常预警，适用于客服、运维、履约管理等场景需求。',
    '自动采集设备运行传感器数据，进行边缘计算与集中聚合分析以辅助业务决策。',
    '全流程覆盖多媒体资料的质检，包括文本、语音与图像内容，输出标准化质检报告。',
    '支持多组织间的审批流协作，配置多层审批节点与流程动态控制策略。',
    '融合任务分布、资源约束与实时数据，智能计算最优物流调度与落地方案。',
    '从业务系统采集关键指标并渲染成数据大屏，支持实时更新与定制化视图。',
    '记录用户在平台的每次接触事件，为营销、客服等角色提供行为路径可视化能力。',
    '结合任务工单与模型推理，智能识别作业流程中存在的潜在风险与不规范行为。',
    '分析历史运维周期与当前设备数据，预测下次维护时间以减少计划外停机。',
    '基于固定规则自动执行重复任务，适用于质检、审批、数据处理等无人值守场景。'
  ];

  const tagsList = [
    ['工业自动化', '流程监控'], ['数据采集', '边缘计算'],
    ['质检流程'], ['审批流'], ['智能调度', '路径规划'],
    ['数据可视化'], ['客户行为'], ['风险识别'],
    ['预测分析'], ['自动化机器人']
  ];

  const models = ['gpt-4o', 'qwen2.5', 'deepseek', 'yi-1.5', 'ChatGLM3'];
  const apps = ['数据采集系统', '运维调度引擎', '质检服务', '流程引擎', '大屏系统'];

  const channelTemplateSamples = [
    [{ name: '工程师', roles: [{ name: '工程师', max: 1 }] }],
    [{ name: '客服', roles: [{ name: '客服人员', max: 2 }] }],
    [{ name: '审批', roles: [{ name: '审核人', max: 2 }] }],
    [{ name: '调度', roles: [{ name: '调度员', max: 1 }] }],
    [{ name: '分析', roles: [{ name: '数据分析师', max: 2 }] }],
    [{ name: '系统通知', roles: [{ name: '系统通知', max: 99 }] }]
  ];

  const dummyData = Array.from({ length: perPage }, (_, i) => {
    const now = Date.now();
    return {
      id: `tpl-${page}-${i}`,
      name: titles[i % titles.length],
      description: descriptions[i % descriptions.length],
      tags: tagsList[i % tagsList.length],
      updated_time: now - Math.floor(Math.random() * 1e8),
      // thumbnail 字段缺失时，页面会使用纯色块占位
      thumbnail: '',
      models: [models[Math.floor(Math.random() * models.length)]],
      apps: [apps[Math.floor(Math.random() * apps.length)]],
      starred: Math.random() > 0.7,
      starCount: Math.floor(Math.random() * 20),
      channelTemplates: channelTemplateSamples[i % channelTemplateSamples.length]
    };
  });

  let filtered = dummyData.filter(tpl => {
    const matchKeyword = filters.keyword
      ? tpl.name.toLowerCase().includes(filters.keyword.toLowerCase())
      : true;

    const matchTags = filters.tags?.length
      ? filters.tags.every(tag => tpl.tags.includes(tag))
      : true;

    return matchKeyword && matchTags;
  });

  // 排序
  if (filters.sort === 'updated') {
    filtered = filtered.sort((a, b) => b.updated_time - a.updated_time);
  } else if (filters.sort === 'starred') {
    filtered = filtered.sort((a, b) => b.starCount - a.starCount);
  }

  return filtered;
};
