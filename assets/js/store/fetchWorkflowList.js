/**
 * 工作流列表数据获取模块
 * 提供工作流列表的模拟数据获取功能，支持分页和筛选
 * @module store/fetchWorkflowList
 */

/**
 * 获取工作流列表数据
 * @param {Object} filters - 筛选条件
 * @param {string} [filters.keyword] - 关键词搜索
 * @param {string} [filters.status] - 工作流状态筛选
 * @param {string[]} [filters.tags] - 标签筛选
 * @param {number} [page=1] - 页码
 * @param {number} [perPage=10] - 每页数量
 * @returns {Promise<Array>} 工作流列表数据
 */
window.fetchWorkflowList = async function(filters = {}, page = 1, perPage = 10) {
  await new Promise(r => setTimeout(r, 400));

  const workflows = [
    {
      name: '上门履约全流程监控',
      description: '实现从用户下单、任务派发到现场完成及客户回执的全链路实时履约监控，支持异常预警与历史回溯',
      channelTemplates: [
        { name: '工程师', roles: [{ name: '工程师', max: 1 }] },
        { name: '客户', roles: [{ name: '客户', max: 1 }] },
        { name: '风控审计', roles: [{ name: '审计人员', max: 2 }] },
        { name: '系统通知', roles: [{ name: '系统通知', max: 99 }] }
      ]
    },
    {
      name: '多网点智能派单调度',
      description: '综合考虑服务网点覆盖、人力资源调度和实时需求量，实现跨区域任务的智能优化派单',
      channelTemplates: [
        { name: '调度', roles: [{ name: '调度员', max: 2 }] },
        { name: '现场', roles: [{ name: '现场人员', max: 3 }] }
      ]
    },
    {
      name: '自动化 BI 报表生成',
      description: '自动抓取多源业务数据，生成可定制图表和维度切片的日报、周报、月报，实现报表全流程自动化',
      channelTemplates: [
        { name: '分析', roles: [{ name: '数据分析师', max: 2 }] }
      ]
    },
    {
      name: 'RAG 数据检索问答链路',
      description: '基于企业知识库构建检索增强型问答系统，结合 Embedding 实现上下文相关性内容精准召回与回答',
      channelTemplates: [
        { name: '问答', roles: [{ name: '知识库管理员', max: 1 }, { name: '业务人员', max: 2 }] }
      ]
    },
    {
      name: '工单多轮对话引导流程',
      description: '结合语言模型引导用户完成完整工单提交流程，支持上下文理解、异常重试与多轮信息收集',
      channelTemplates: [
        { name: '客服', roles: [{ name: '客服人员', max: 2 }] },
        { name: '用户交互', roles: [{ name: '客户', max: 1 }] }
      ]
    },
    {
      name: '电子围栏实时事件推送',
      description: '基于地理围栏监控实现关键人员/车辆越界检测，自动触发推送告警至指定业务系统或移动端',
      channelTemplates: [
        { name: '事件监控', roles: [{ name: '安防人员', max: 2 }] },
        { name: '响应', roles: [{ name: '应急响应', max: 1 }] }
      ]
    },
    {
      name: '地址纠错与标准化流程',
      description: '对用户输入地址进行模糊匹配、补全、结构化转换，解决地址错写、缩写、多级描述等问题',
      channelTemplates: [
        { name: '地址', roles: [{ name: '地址专员', max: 2 }] }
      ]
    },
    {
      name: '智能营销线索打标签流程',
      description: '根据用户行为路径和兴趣偏好，自动标注营销标签，实现个性化推荐和后续销售自动跟进',
      channelTemplates: [
        { name: '销售跟进', roles: [{ name: '营销顾问', max: 3 }] }
      ]
    },
    {
      name: '多语种 FAQ 自动应答流程',
      description: '支持中文、英文等多语种 FAQ 问题自动识别、分类和准确答复，提升客服处理效率与体验',
      channelTemplates: [
        { name: '语言', roles: [{ name: '语言专家', max: 2 }] },
        { name: '客服', roles: [{ name: '客服人员', max: 2 }] }
      ]
    },
    {
      name: '合同审批流数字化重建',
      description: '将传统线下合同流程数字化改造，整合审批节点、版本比对和归档流程，实现全流程智能化自动处理',
      channelTemplates: [
        { name: '合同', roles: [{ name: '法务人员', max: 1 }, { name: '审核人', max: 2 }] },
        { name: '文档', roles: [{ name: '文档管理员', max: 1 }] }
      ]
    }
  ];

  const tagsList = [
    ['客户服务', 'RPA流程'],
    ['运维管理'],
    ['客户服务'],
    ['运维管理', '流程优化'],
    ['监控预警', '数据同步'],
    ['自动化', 'RPA流程'],
    ['实时计算', '监控预警', '运维管理'],
    ['监控预警'],
    ['监控预警', '自动化', '数据同步'],
    ['监控预警', '智能推荐', '客户服务']
  ];

  const models = ['deepseek', 'qwen2.5', 'gpt-4o', 'yi-1.5', 'moonshot', 'ChatGLM3'];
  const apps = ['基础信息管理', '电子围栏', '智能规划引擎', '地址解析服务'];

  const dummyData = workflows.map((wf, i) => {
    const updatedAt = Date.now() - Math.floor(Math.random() * 1e8);
    const createdAt = updatedAt - Math.floor(Math.random() * 1e7);
    return {
      id: `wf-${page}-${i}`,
      name: wf.name,
      description: wf.description,
      tags: tagsList[i % tagsList.length],
      updated_time: updatedAt,
      created_time: createdAt,
      models: [models[i % models.length]],
      apps: [apps[i % apps.length]],
      instances: Math.floor(Math.random() * 50),
      executions: Math.floor(Math.random() * 200),
      // thumbnail 字段缺失时，页面会使用纯色块占位
      thumbnail: '',
      status: Math.random() < 0.1 ? 'paused' : 'active',
      starred: Math.random() > 0.7,
      channelTemplates: wf.channelTemplates
    };
  });

  return dummyData.filter(wf => {
    const matchKeyword = filters.keyword
      ? wf.name.toLowerCase().includes(filters.keyword.toLowerCase())
      : true;

    const matchStatus = filters.status
      ? wf.status === filters.status
      : true;

    const matchTags = filters.tags?.length
      ? filters.tags.every(tag => wf.tags.includes(tag))
      : true;

    return matchKeyword && matchStatus && matchTags;
  });
};
