/**
 * API 配置文件
 * 请在此配置你的应用密钥和访客信息
 */

export const API_CONFIG = {
  // 应用密钥 - 必填
  // 获取方式：登录腾讯云知识引擎控制台 -> 应用管理 -> 应用详情 -> 应用密钥
  BOT_APP_KEY: 'UWGsXByLEmpcrIBlBsXKIFQyChkvtFqYOYTLuSkIvETMzTcoQoryouTkQHGCxlziKIgiukwpwgvELUemvvpGuUXNAzrXLrGXLaCKAArqewQUUutpXWLaQcGriCxrilja',
  
  // 机器人业务 ID（BotBizId）- 图片上传需要
  // 获取方式：腾讯云控制台 -> 应用详情 -> 应用 ID（长数字串）
  BOT_BIZ_ID: '1996763579990850112', // 例如：'1727231073371148288'
  
  // 访客业务 ID - 必填
  // 建议使用唯一标识，如用户 ID、设备 ID 等
  VISITOR_BIZ_ID: 'visitor_demo_001',
  
  // 模型名称 - 可选
  // 可选值：hunyuan, hunyuan-13B, hunyuan-turbo, hunyuan-standard-256K, 
  //        hunyuan-role, lke-deepseek-r1, lke-deepseek-v3 等
  MODEL_NAME: '', // 默认使用应用配置的模型
  
  // 是否开启联网搜索 - 可选
  // 可选值：'' (跟随应用配置), 'enable' (开启), 'disable' (关闭)
  SEARCH_NETWORK: '',
  
  // 流式回复频率控制 - 可选
  // 控制应用回包频率，值越小回包越频繁（体验越流畅，流量开销越大）
  STREAMING_THROTTLE: 5,
  
  // 是否开启增量输出 - 可选
  // true: 每次只返回新增的内容；false: 每次返回完整内容
  INCREMENTAL: false,
  
  // 系统角色指令（提示词）- 可选
  // 为空时使用应用配置，填写时使用当前值
  SYSTEM_ROLE: '',
  
  // 自定义变量 - 可选
  // 用于传递参数给工作流或设置知识库检索范围
  CUSTOM_VARIABLES: {},
}

/**
 * 获取 API 配置
 * @returns {Object}
 */
export function getApiConfig() {
  // 检查必填项
  if (!API_CONFIG.BOT_APP_KEY || API_CONFIG.BOT_APP_KEY === 'YOUR_BOT_APP_KEY_HERE') {
    console.warn('⚠️ 请在 src/config/apiConfig.js 中配置 BOT_APP_KEY')
  }
  
  return { ...API_CONFIG }
}

/**
 * 更新 API 配置
 * @param {Object} config - 配置对象
 */
export function updateApiConfig(config) {
  Object.assign(API_CONFIG, config)
}
