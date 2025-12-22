# 🚀 API 接口集成指南

本指南详细说明如何配置和使用腾讯云知识引擎 LKE 的 SSE 对话接口。

## 📋 前置要求

1. **腾讯云账号**：需要有腾讯云账号
2. **知识引擎应用**：已创建并发布的 LKE 应用
3. **应用密钥**：从控制台获取的 `bot_app_key`

## 🔑 获取应用密钥

### 步骤 1：登录控制台
访问 [腾讯云知识引擎控制台](https://console.cloud.tencent.com/lke)

### 步骤 2：选择应用
在应用管理列表中，找到你要使用的应用

### 步骤 3：获取密钥
1. 点击应用名称，进入应用详情
2. 在 **应用信息** 或 **接入配置** 页面
3. 找到 **应用密钥 (bot_app_key)**
4. 复制密钥值

示例格式：`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

## ⚙️ 配置步骤

### 方式一：直接修改配置文件（推荐）

编辑 `src/config/apiConfig.js`：

```javascript
export const API_CONFIG = {
  // 1. 粘贴你的应用密钥
  BOT_APP_KEY: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  
  // 2. 设置访客 ID（建议使用唯一标识）
  VISITOR_BIZ_ID: 'visitor_demo_001',
  
  // 3. 可选：选择模型
  MODEL_NAME: 'lke-deepseek-r1', // DeepSeek-R1 支持思考过程
  
  // 4. 可选：开启联网搜索
  SEARCH_NETWORK: 'enable',
  
  // 5. 其他配置
  STREAMING_THROTTLE: 5,
  INCREMENTAL: false,
  SYSTEM_ROLE: '',
  CUSTOM_VARIABLES: {},
}
```

### 方式二：使用环境变量

1. 复制 `.env.example` 为 `.env`
2. 填写配置
3. 重启开发服务器

## 🎯 核心功能说明

### 1. 流式对话

系统自动处理 SSE 流式响应，实现打字机效果：

```javascript
// 在 App.vue 中已实现
sendChatMessage(params, onMessage, onError, onComplete)
```

### 2. 思考过程展示（DeepSeek-R1）

使用 `lke-deepseek-r1` 模型时，会收到 `thought` 事件：

```javascript
// 配置
MODEL_NAME: 'lke-deepseek-r1'

// 自动处理思考事件
case 'thought':
  currentThought = {
    title: '思考完成',
    content: procedure.debugging?.content,
    status: 'processing',
    elapsed: data.elapsed
  }
```

### 3. 参考来源

系统自动处理 `reference` 事件，展示引用来源：

```javascript
case 'reference':
  currentSources = data.references.map(ref => ({
    title: ref.name,
    description: ref.url,
    url: ref.url
  }))
```

### 4. Token 统计

可在控制台查看 Token 使用情况：

```javascript
case 'token_stat':
  console.log('Token 统计:', {
    token_count: data.token_count,
    elapsed: data.elapsed
  })
```

## 🔍 事件类型说明

### reply 事件
- **触发**：AI 回复消息时
- **频率**：流式输出，多次触发
- **关键字段**：
  - `content` - 消息内容
  - `is_final` - 是否输出完成
  - `reply_method` - 回复方式

### thought 事件（DeepSeek-R1 专用）
- **触发**：使用 DeepSeek-R1 模型时
- **作用**：展示 AI 的推理过程
- **关键字段**：
  - `procedures` - 思考步骤
  - `elapsed` - 耗时（毫秒）

### reference 事件
- **触发**：有参考来源时
- **作用**：展示引用的知识库内容或联网搜索结果
- **关键字段**：
  - `references` - 来源列表
  - `type` - 来源类型（1:问答, 2:文档, 4:联网）

### token_stat 事件
- **触发**：对话结束时
- **作用**：统计 Token 消耗
- **关键字段**：
  - `token_count` - Token 数量
  - `procedures` - 调用过程

### error 事件
- **触发**：发生错误时
- **关键字段**：
  - `code` - 错误码
  - `message` - 错误信息

## ⚠️ 常见错误处理

### 460004 - 应用不存在
**原因**：`bot_app_key` 错误或应用已删除
**解决**：检查密钥是否正确，确认应用状态

### 460032 - 模型余额不足
**原因**：选择的模型 Token 已用完
**解决**：购买 Token 或开启后付费模式

### 460011 - 超出并发数限制
**原因**：同时请求数过多
**解决**：等待当前请求完成或升级并发限制

### 460034 - 输入内容过长
**原因**：消息超过模型最大长度限制
**解决**：缩短输入内容或使用长文本模型

## 📊 性能优化建议

### 1. 流式频率控制
```javascript
STREAMING_THROTTLE: 5 // 推荐值 5-10
```
- 值越小，体验越流畅，但流量开销越大
- 值越大，流量节省，但可能出现延迟

### 2. 增量输出
```javascript
INCREMENTAL: true // 只返回新增内容
```
- 减少数据传输量
- 需要自行拼接内容

### 3. 会话管理
```javascript
// 生成唯一会话 ID
sessionId = generateSessionId()

// 刷新对话时生成新 ID
sessionId = generateSessionId()
```

## 🧪 测试步骤

### 1. 基础测试
1. 配置 `BOT_APP_KEY`
2. 运行 `npm run dev`
3. 发送消息测试

### 2. 功能测试

**测试流式输出：**
- 发送长问题，观察打字机效果

**测试思考过程：**
- 配置 `MODEL_NAME: 'lke-deepseek-r1'`
- 发送复杂问题，查看思考过程

**测试联网搜索：**
- 配置 `SEARCH_NETWORK: 'enable'`
- 询问实时信息（如"今天天气"）

**测试参考来源：**
- 询问知识库中的问题
- 查看引用来源卡片

### 3. 错误测试
- 配置错误的 `bot_app_key`，测试错误提示
- 发送超长内容，测试限制处理

## 📞 技术支持

- **文档**：[腾讯云知识引擎文档](https://cloud.tencent.com/document/product/1759)
- **控制台**：[知识引擎控制台](https://console.cloud.tencent.com/lke)
- **工单支持**：在控制台提交工单

## 🎓 进阶功能

### 自定义变量
用于工作流或知识库检索范围设置：

```javascript
CUSTOM_VARIABLES: {
  'UserID': '10220022',
  'Department': 'IT'
}
```

### 系统角色指令
自定义 AI 的行为：

```javascript
SYSTEM_ROLE: `你是一个专业的技术支持助手。
规则：
1. 回答要准确、专业
2. 使用友好的语气
3. 如果不确定，诚实告知用户`
```

### 工作流控制
```javascript
// 开启/关闭工作流
workflow_status: 'enable' // or 'disable'
```

## ✅ 检查清单

上线前检查：

- [ ] 已配置正确的 `BOT_APP_KEY`
- [ ] 已设置合适的 `VISITOR_BIZ_ID`
- [ ] 已测试基础对话功能
- [ ] 已测试错误处理
- [ ] 已检查 Token 余额
- [ ] 已了解并发限制
- [ ] 已阅读相关文档

---

**祝你使用愉快！** 🎉
