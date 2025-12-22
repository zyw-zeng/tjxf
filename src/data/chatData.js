// 模拟聊天数据
export const mockMessages = [
  {
    content: '湖南金龙小镇4.29特别重大爆炸后续处置工作进展如何',
    isUser: true,
    timestamp: '12:09 20:02',
    isFinal: true,
    isPrintAnimate: false,
    isMdExpand: false
  },
  {
    content: `湖南金龙小镇4.29特别重大爆炸后续处置工作的进展如下：

**1. 成立行政问责大会人员：**
2019年9月，国务院成立"金龙镇4·29"特别重大爆炸事故调查组，由应急管理部牵头，组织了多方专家进行事故调查和责任追究工作。

**2. 出台赔偿细则并进行赔偿：**
2019年7月，根据《湖南省爆炸及工伤赔偿标准》出台赔偿方案，并进行赔偿工作，总赔付金额超过5亿元人民币。

**3. 对建筑大亮进行处理评估：**
2019年秋季，对受到影响的建筑进行安全评估，特别是一些距离爆炸中心较近的楼房进行了修复或拆除处理。

**4. 未被载运逾相关部门追工：**
在事故发生后，未经许可擅自搬运的遗体交由相关部门追究刑事责任，同时启动追责程序针对责任方进行处理。

此外，地方政府还积极进行环境修复，对事故现场进行清理整顿，确保公共安全的恢复。现状趋势就是努力将事故影响最小化，确保类似事故不再发生的情况下，这些恢复性工作得到切实落实。`,
    isUser: false,
    timestamp: '',
    isFinal: true,
    isPrintAnimate: false,
    isMdExpand: false,
    thought: {
      title: '思考完成',
      nodeName: 'deepseek',
      status: 'success',
      detailVisible: false,
      elapsed: 17485,
      titleIcon: 'https://lke-realtime-1251316161.cos.ap-guangzhou.myqcloud.com/icon/thinking.png',
      content: `好的，我现在需要处理用户的问题"湖南金龙小镇4.29特别重大爆炸后续处置工作进展如何"，并根据提供的搜索结果生成一个回答。

首先，我需要从搜索结果中提取关键信息。结果显示事故发生后，国务院成立了调查组，进行责任追究；出台了赔偿方案并进行赔偿；对受影响建筑进行了评估和处理；对相关责任人进行追责。

需要将这些信息整合成一个连贯的回答，并用正确的引用标注。确保回答简洁明了，使用中文口语化表达。`
    },
    sources: [
      {
        title: '国务院湖南省浏阳市"12·4"重大爆炸事故调查报告',
        description: 'C.7.1住宿设施消防安全要求'
      },
      {
        title: '公安部、应急管理部就浏阳市、重庆市非法生产、储存、销售、运输...',
        description: ''
      }
    ]
  },
  {
    content: '具体，泸西市、涪陵市非法生产、储存、运输烟花爆竹案件进展情况分别如何？',
    isUser: true,
    timestamp: '',
    isFinal: true,
    isPrintAnimate: false,
    isMdExpand: false
  },
  {
    content: '湖西市非法生产、储存、运输烟花爆竹案件已刑拘7人，起诉3人...',
    isUser: false,
    timestamp: '',
    isFinal: false,
    isPrintAnimate: true,
    isMdExpand: false,
    sources: [
      {
        title: '公安部、应急管理部就浏阳市、重庆市非法生产、储存、销售、运输...',
        description: ''
      }
    ]
  }
]
