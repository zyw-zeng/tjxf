# 天津滨河知识库问答系统

一个基于 Vue3 + lke-component-vue3 构建的现代化 AI 聊天界面，采用模块化组件化设计。

## ✨ 特性

- 🎨 **现代化 UI** - 仿照主流 AI 聊天产品的界面设计
- 🧩 **模块化组件** - 高度解耦的组件架构，易于维护和扩展
- 💬 **丰富功能** - 支持 Markdown 渲染、思考过程展示、引用来源等
- ⚡ **高性能** - 基于 Vue3 + Vite 构建，开发体验极佳
- 🔄 **实时交互** - 支持打字动画、点赞踩、复制等交互功能

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API 密钥

编辑 `src/config/apiConfig.js` 文件，配置你的应用密钥：

```javascript
export const API_CONFIG = {
  // 应用密钥 - 必填
  BOT_APP_KEY: 'YOUR_BOT_APP_KEY_HERE', // 替换为你的密钥
  
  // 访客业务 ID - 必填
  VISITOR_BIZ_ID: 'visitor_demo_001',
  
  // 可选配置
  MODEL_NAME: '', // 如: 'lke-deepseek-r1', 'lke-deepseek-v3', 'hunyuan'
  SEARCH_NETWORK: '', // 'enable' 或 'disable'
  STREAMING_THROTTLE: 5,
  INCREMENTAL: false,
}
```

**获取应用密钥：**
1. 登录 [腾讯云知识引擎控制台](https://console.cloud.tencent.com/lke)
2. 进入 **应用管理** → 选择应用 → **应用详情**
3. 复制 **应用密钥 (bot_app_key)**

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📦 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **lke-component-vue3** - 知识引擎大模型对话消息渲染组件

## 📂 项目结构

```
tjxf/
├── src/
│   ├── components/              # 组件目录
│   │   ├── ChatHeader.vue      # 头部组件（标题、操作按钮）
│   │   ├── ChatMessage.vue     # 消息组件（支持用户/AI消息）
│   │   ├── ChatInput.vue       # 输入框组件（发送消息、上传附件）
│   │   ├── ChatLayout.vue      # 聊天布局组件（整合所有子组件）
│   │   └── SourceCard.vue      # 引用来源卡片组件
│   ├── data/
│   │   └── chatData.js         # 模拟数据
│   ├── App.vue                 # 根组件
│   └── main.js                 # 入口文件
├── index.html                   # HTML 模板
├── vite.config.js              # Vite 配置
├── package.json                # 项目配置
└── README.md                   # 项目说明
```

## 🧩 组件说明

### ChatLayout
主聊天布局组件，负责整合所有子组件并管理状态。

**Props:**
- `title` - 聊天标题
- `messages` - 消息列表
- `sending` - 是否正在发送中

**Events:**
- `send` - 发送消息
- `attach` - 上传附件
- `refresh` - 刷新对话
- `settings` - 打开设置
- `user` - 查看用户信息

### ChatHeader
头部组件，包含标题和操作按钮。

**Events:**
- `refresh` - 刷新
- `settings` - 设置
- `user` - 用户

### ChatMessage
消息组件，支持用户消息和 AI 消息的展示。

**Props:**
- `content` - 消息内容
- `isUser` - 是否为用户消息
- `timestamp` - 时间戳
- `isFinal` - 是否输出结束
- `isPrintAnimate` - 是否显示打字动画
- `thought` - 思考内容（AI 思考过程）
- `sources` - 引用来源列表

**Events:**
- `copy` - 复制消息
- `like` - 点赞
- `dislike` - 踩
- `refresh` - 重新生成

### ChatInput
输入框组件，支持多行输入、字符统计。

**Props:**
- `placeholder` - 占位文本
- `sending` - 是否发送中

**Events:**
- `send` - 发送消息
- `attach` - 上传附件

### SourceCard
引用来源卡片组件，展示参考资料。

**Props:**
- `title` - 标题
- `description` - 描述

## 🎯 功能特性

### 1. AI 思考过程展示
使用 `MsgThought` 组件展示 AI 的思考过程（如 DeepSeek 的推理过程）

### 2. Markdown 渲染
使用 `MsgContent` 组件支持 Markdown 格式的消息渲染

### 3. 引用来源
支持展示消息的参考来源，点击可跳转

### 4. 交互功能
- 复制消息内容
- 点赞/踩消息
- 重新生成回答
- 上传附件

### 5. 打字动画
支持模拟 AI 实时输出的打字效果

## 🔧 API 配置说明

### 配置文件：`src/config/apiConfig.js`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `BOT_APP_KEY` | string | ✅ | 应用密钥，从控制台获取 |
| `VISITOR_BIZ_ID` | string | ✅ | 访客业务ID，建议使用唯一标识 |
| `MODEL_NAME` | string | ❌ | 模型名称，如 `lke-deepseek-r1`、`hunyuan` |
| `SEARCH_NETWORK` | string | ❌ | 联网搜索：`enable`/`disable` |
| `STREAMING_THROTTLE` | number | ❌ | 流式回复频率（1-100），默认5 |
| `INCREMENTAL` | boolean | ❌ | 是否增量输出，默认 false |
| `SYSTEM_ROLE` | string | ❌ | 系统角色指令（提示词） |
| `CUSTOM_VARIABLES` | object | ❌ | 自定义变量 |

### 支持的模型

- `hunyuan` - 混元大模型高级版
- `hunyuan-13B` - 混元大模型标准版
- `hunyuan-turbo` - 混元大模型Turbo版
- `hunyuan-standard-256K` - 混元大模型长文本版
- `lke-deepseek-r1` - **DeepSeek-R1**（支持思考过程展示）
- `lke-deepseek-v3` - DeepSeek-V3

### 特殊功能

#### 1. DeepSeek-R1 思考过程
使用 `lke-deepseek-r1` 模型时，会自动显示 AI 的思考过程：

```javascript
// 配置文件中设置
MODEL_NAME: 'lke-deepseek-r1'
```

#### 2. 联网搜索
开启后 AI 可以搜索实时信息：

```javascript
SEARCH_NETWORK: 'enable'
```

#### 3. 自定义提示词
覆盖应用默认的提示词：

```javascript
SYSTEM_ROLE: '你是一个专业的客服助手，请用友好的语气回答问题。'
```

## 🔧 自定义开发

### API 服务文件：`src/api/chatApi.js`

核心函数：
- `sendChatMessage()` - 发送 SSE 聊天请求
- `generateSessionId()` - 生成会话ID
- `generateVisitorId()` - 生成访客ID
- `getErrorMessage()` - 获取错误信息

### 使用示例

```javascript
import { sendChatMessage } from './api/chatApi.js'

const cancelFn = sendChatMessage(
  {
    content: '你好',
    session_id: 'session-123',
    bot_app_key: 'your-app-key',
    visitor_biz_id: 'visitor-001',
  },
  // 消息回调
  (event) => {
    console.log('收到消息:', event.type, event.data)
  },
  // 错误回调
  (error) => {
    console.error('错误:', error)
  },
  // 完成回调
  () => {
    console.log('完成')
  }
)

// 取消请求
cancelFn()
```

## 📖 参考文档

- [Vue 3 文档](https://cn.vuejs.org/)
- [Vite 文档](https://cn.vitejs.dev/)
- [lke-component-vue3](https://www.npmjs.com/package/lke-component-vue3)

## 📄 License

MIT
