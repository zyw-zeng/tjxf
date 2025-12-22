<template>
  <div id="app">
    <ChatLayout :title="chatTitle" :messages="messages" :sending="sending" :searchNetwork="searchNetwork"
      @send="handleSend" @stop="stopGeneration" @clear="handleClear" @like="handleLike" @dislike="handleDislike"
      @refreshMessage="handleRefreshMessage" @toggleSearchNetwork="toggleSearchNetwork"
      @updateUserMessage="handleUpdateUserMessage" />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import ChatLayout from './components/ChatLayout.vue'
import { sendChatMessage, generateSessionId, generateVisitorId, getErrorMessage } from './api/chatApi.js'
import { getApiConfig } from './config/apiConfig.js'
import '../node_modules/lke-component-vue3/dist/style.css'

const chatTitle = ref('消防科普知识库问答')
const messages = ref([])
const sending = ref(false)
const searchNetwork = ref('disable') // 联网搜索状态: 'enable' | 'disable'

// API 配置
const apiConfig = ref(null)
const sessionId = ref('')
const visitorId = ref('')

// 当前 AI 回复
let currentAIMessage = null
let currentThought = null
let currentSources = []
let cancelCurrentRequest = null

// 初始化
onMounted(() => {
  // 获取 API 配置
  apiConfig.value = getApiConfig()

  // 生成会话 ID 和访客 ID
  sessionId.value = generateSessionId()
  visitorId.value = generateVisitorId()

  console.log('📋 会话信息:', {
    sessionId: sessionId.value,
    visitorId: visitorId.value,
    appKey: apiConfig.value.BOT_APP_KEY ? '已配置' : '未配置'
  })

  // 检查配置
  if (!apiConfig.value.BOT_APP_KEY || apiConfig.value.BOT_APP_KEY === 'YOUR_BOT_APP_KEY_HERE') {
    messages.value.push({
      content: '⚠️ **未配置 API 密钥**\n\n请在 `src/config/apiConfig.js` 中配置你的 `BOT_APP_KEY`。\n\n获取方式：\n1. 登录腾讯云知识引擎控制台\n2. 进入应用管理 → 应用详情\n3. 复制应用密钥\n\n配置完成后刷新页面即可使用。',
      isUser: false,
      timestamp: '',
      isFinal: true,
      isPrintAnimate: false,
      isMdExpand: false
    })
  }
  // 每次进入都是新对话，不加载模拟数据
})

// 发送消息
const handleSend = (content) => {
  // 检查配置
  if (!apiConfig.value.BOT_APP_KEY || apiConfig.value.BOT_APP_KEY === 'YOUR_BOT_APP_KEY_HERE') {
    alert('请先在 src/config/apiConfig.js 中配置 BOT_APP_KEY')
    return
  }

  // 添加用户消息
  const userMessage = {
    content: content,
    isUser: true,
    timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isFinal: true,
    isPrintAnimate: false,
    isMdExpand: false
  }
  messages.value.push(userMessage)

  // 重置当前 AI 回复
  currentAIMessage = {
    content: '',
    isUser: false,
    timestamp: '',
    isFinal: false,
    isPrintAnimate: true,
    isMdExpand: false,
    thought: null,
    sources: [],
    quoteInfos: [], // 引用角标位置信息
    references: [] // 引用来源详细信息
  }
  currentThought = null
  currentSources = []

  // 设置思考状态：根据是否开启联网搜索显示不同内容
  if (searchNetwork.value === 'enable') {
    // 开启联网搜索
    currentThought = {
      title: '联网搜索',
      nodeName: 'search',
      status: 'processing',
      detailVisible: false,
      elapsed: 0,
      titleIcon: 'https://lke-realtime-1251316161.cos.ap-guangzhou.myqcloud.com/icon/thinking.png',
      content: '联网搜索中，请稍等...'
    }
  } else {
    // 未开启联网搜索
    currentThought = {
      title: '思考中',
      nodeName: 'thinking',
      status: 'processing',
      detailVisible: false,
      elapsed: 0,
      titleIcon: 'https://lke-realtime-1251316161.cos.ap-guangzhou.myqcloud.com/icon/thinking.png',
      content: '思考中，请稍等...'
    }
  }
  currentAIMessage.thought = { ...currentThought }

  // 添加空的 AI 消息占位
  messages.value.push(currentAIMessage)
  const messageIndex = messages.value.length - 1

  sending.value = true

  // 调用 SSE API
  cancelCurrentRequest = sendChatMessage(
    {
      content: content,
      session_id: sessionId.value,
      bot_app_key: apiConfig.value.BOT_APP_KEY,
      visitor_biz_id: apiConfig.value.VISITOR_BIZ_ID || visitorId.value,
      model_name: apiConfig.value.MODEL_NAME,
      search_network: searchNetwork.value, // 使用状态管理的联网搜索设置
      streaming_throttle: apiConfig.value.STREAMING_THROTTLE,
      incremental: apiConfig.value.INCREMENTAL,
      system_role: apiConfig.value.SYSTEM_ROLE,
      custom_variables: apiConfig.value.CUSTOM_VARIABLES,
    },
    // 消息回调
    (event) => {
      handleSSEMessage(event, messageIndex)
    },
    // 错误回调
    (error) => {
      console.error('❌ API 错误:', error)
      currentAIMessage.content = `**请求失败**\n\n${error.message || '网络错误，请稍后重试'}`
      currentAIMessage.isFinal = true
      currentAIMessage.isPrintAnimate = false
      sending.value = false
    },
    // 完成回调
    () => {
      console.log('✅ 消息流结束')
      sending.value = false
      cancelCurrentRequest = null
    }
  )
}

// 切换联网搜索
const toggleSearchNetwork = () => {
  searchNetwork.value = searchNetwork.value === 'enable' ? 'disable' : 'enable'
  console.log('🔄 联网搜索已切换为:', searchNetwork.value)
}

// 处理 SSE 消息
const handleSSEMessage = (event, messageIndex) => {
  const { type, data } = event

  switch (type) {
    case 'reply':
      // 更新回复内容 - 过滤掉可能包含的用户问题
      let replyContent = data.content || ''

      // 开始流式输出时，隐藏思考状态（非用户回显且有内容）
      if (!data.is_from_self && replyContent && currentAIMessage.thought) {
        currentAIMessage.thought = null
      }

      // 如果AI回复中包含用户的原始问题，尝试移除 - 优化长内容处理
      if (messageIndex > 0 && replyContent.length < 10000) { // 只对较短内容执行过滤
        const userMessage = messages.value[messageIndex - 1]
        if (userMessage && userMessage.isUser) {
          const userQuestion = userMessage.content.trim()
          const contentTrimmed = replyContent.trim()

          // 只检查开头的前500个字符，避免处理整个长文档
          const checkLength = Math.min(500, contentTrimmed.length)
          const contentStart = contentTrimmed.substring(0, checkLength)

          // 优先检查：如果开头完全匹配用户问题，直接移除
          if (contentStart.startsWith(userQuestion)) {
            replyContent = contentTrimmed.substring(userQuestion.length).trim()
            console.log('🔍 检测到完全重复的用户问题，已移除')
          } else if (userQuestion.length < 100) { // 只对短问题应用正则过滤
            // 如果不是完全匹配，使用正则表达式过滤（仅限短问题）
            const escapedQuestion = userQuestion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

            // 简化的过滤规则，只检查最常见的格式
            const patterns = [
              new RegExp(`^\\s*${escapedQuestion}\\s*[：:,，]?\\s*`, 'i'),
              new RegExp(`^\\s*[问答]\\s*[：:]\\s*${escapedQuestion}\\s*`, 'i')
            ]

            // 仅在内容开头应用过滤
            for (const pattern of patterns) {
              const newContent = contentStart.replace(pattern, '')
              if (newContent !== contentStart) {
                replyContent = newContent + contentTrimmed.substring(checkLength)
                console.log('🔍 应用简化过滤规则移除了重复内容')
                break
              }
            }
          }

          // 移除开头的多余空白和换行
          replyContent = replyContent.replace(/^\s+/, '')

          // 如果内容以"答："、"A:"、"回答："等开头，也移除
          replyContent = replyContent.replace(/^(?:答|回答|解答|[Aa])\s*[：:]\s*/, '')
        }
      }

      currentAIMessage.content = replyContent
      currentAIMessage.isFinal = data.is_final

      // 保存引用信息
      if (data.quote_infos && data.quote_infos.length > 0) {
        currentAIMessage.quoteInfos = data.quote_infos
        console.log('📌 引用信息 (quote_infos):', JSON.stringify(data.quote_infos, null, 2))
      } else {
        console.log('⚠️ 未收到 quote_infos 数据或为空:', data.quote_infos)
      }

      // 从 reply 事件的 knowledge 字段提取文档（作为 reference 事件的备用）
      // 注意：根据官方文档，quote_infos.index 对应 reference.index（或 reference.id）
      if (data.knowledge && data.knowledge.length > 0 && data.is_final) {
        // 如果还没有 references（说明没有收到 reference 事件），从 knowledge 创建占位符
        if (!currentAIMessage.references || currentAIMessage.references.length === 0) {
          // 从 quote_infos 中提取所有唯一的 index 值
          const uniqueIndices = data.quote_infos
            ? [...new Set(data.quote_infos.map(q => q.index))].sort((a, b) => a - b)
            : data.knowledge.map((_, idx) => idx + 1)

          const knowledgeRefs = uniqueIndices.map(index => ({
            id: String(index),
            index: index,  // 使用 quote_infos 中的 index
            type: 2,
            name: `参考来源 ${index}`,
            doc_name: `参考来源 ${index}`,
            url: '',
            _fromKnowledge: true  // 标记为临时数据
          }))

          currentAIMessage.references = knowledgeRefs
          currentAIMessage.sources = knowledgeRefs.map(ref => ({
            title: ref.name,
            description: '等待加载详细信息...',
            url: ref.url,
            index: ref.index
          }))

          console.log('📚 从 reply.knowledge 创建引用占位符:', {
            count: knowledgeRefs.length,
            indices: uniqueIndices,
            refs: knowledgeRefs,
            warning: '⚠️ 后端未发送 reference 事件，显示占位符'
          })
        }
      }

      console.log('📌 当前消息对象:', {
        hasQuoteInfos: !!currentAIMessage.quoteInfos,
        quoteInfosLength: currentAIMessage.quoteInfos?.length,
        quoteInfosIndices: currentAIMessage.quoteInfos?.map(q => q.index),
        hasReferences: !!currentAIMessage.references,
        referencesLength: currentAIMessage.references?.length,
        referencesIndices: currentAIMessage.references?.map(r => r.index),
        hasSources: !!currentAIMessage.sources,
        sourcesLength: currentAIMessage.sources?.length,
        sourcesIndices: currentAIMessage.sources?.map(s => s.index)
      })

      // 消息完成时添加时间戳
      if (data.is_final && !currentAIMessage.timestamp) {
        currentAIMessage.timestamp = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

        // 检查参考来源是否包含 DB 或市级标准，如果是则添加地方标准提示
        if (currentAIMessage.references && currentAIMessage.references.length > 0) {
          const hasLocalStandardReference = currentAIMessage.references.some(ref => {
            const fileName = ref.name || ref.doc_name || ''
            return fileName.includes('DB') || fileName.includes('市')
          })

          if (hasLocalStandardReference && currentAIMessage.content) {
            // 在回答末尾添加地方标准提示
            currentAIMessage.content = currentAIMessage.content.trim() + '\n\n注：地方标准仅适用于发布地区，使用时请注意适用范围。'
            console.log('📌 检测到地方标准文件，已添加提示')
          }
        }

        // 添加完成时的调试信息，检查参考来源显示条件
        console.log('✅ 消息完成，检查参考来源显示条件:', {
          isFinal: currentAIMessage.isFinal,
          hasSources: !!(currentAIMessage.sources && currentAIMessage.sources.length > 0),
          sourcesLength: currentAIMessage.sources ? currentAIMessage.sources.length : 0,
          hasQuoteInfos: !!(currentAIMessage.quoteInfos && currentAIMessage.quoteInfos.length > 0),
          quoteInfosLength: currentAIMessage.quoteInfos ? currentAIMessage.quoteInfos.length : 0,
          shouldShowReferences: currentAIMessage.isFinal &&
            currentAIMessage.sources &&
            currentAIMessage.sources.length > 0 &&
            currentAIMessage.quoteInfos &&
            currentAIMessage.quoteInfos.length > 0
        })
      }

      // 如果命中敏感内容
      if (data.is_evil) {
        currentAIMessage.content = '⚠️ 消息包含敏感内容，发送失败'
        currentAIMessage.isFinal = true
      }

      // 更新消息 - 流式数据必须同步更新
      if (messageIndex >= 0 && messageIndex < messages.value.length) {
        // 确保消息数组索引有效
        const updatedMessage = { ...currentAIMessage }
        messages.value.splice(messageIndex, 1, updatedMessage)

        console.log('📨 回复更新:', {
          is_final: data.is_final,
          content_length: replyContent.length,
          reply_method: data.reply_method,
          message_index: messageIndex,
          messages_length: messages.value.length,
          timestamp: new Date().toISOString(),
          content_preview: replyContent.length > 100 ? replyContent.substring(0, 100) + '...' : replyContent,
          force_updated: true
        })

        // 额外的长内容调试信息
        if (replyContent.length > 3000) {
          console.log('🔍 长内容流式更新:', {
            total_length: replyContent.length,
            has_tables: replyContent.includes('|'),
            has_markdown_headers: replyContent.includes('#'),
            line_count: replyContent.split('\n').length,
            is_streaming: !data.is_final,
            update_method: 'splice_replace'
          })
        }
      } else {
        console.error('❌ 消息索引无效:', messageIndex, 'messages长度:', messages.value.length)
      }
      break

    case 'thought':
      // DeepSeek-R1 思考过程
      if (data.procedures && data.procedures.length > 0) {
        const procedure = data.procedures[0]

        if (!currentThought) {
          currentThought = {
            title: '思考完成',
            nodeName: 'deepseek',
            status: procedure.status === 'success' ? 'success' : 'processing',
            detailVisible: false,
            elapsed: data.elapsed || 0,
            titleIcon: 'https://lke-realtime-1251316161.cos.ap-guangzhou.myqcloud.com/icon/thinking.png',
            content: procedure.debugging?.content || ''
          }
        } else {
          currentThought.content = procedure.debugging?.content || currentThought.content
          currentThought.status = procedure.status === 'success' ? 'success' : 'processing'
          currentThought.elapsed = data.elapsed || currentThought.elapsed
        }

        currentAIMessage.thought = { ...currentThought }
        // 使用splice强制触发Vue响应式更新
        if (messageIndex >= 0 && messageIndex < messages.value.length) {
          const updatedMessage = { ...currentAIMessage }
          messages.value.splice(messageIndex, 1, updatedMessage)
        }

        console.log('🤔 思考:', {
          status: procedure.status,
          elapsed: data.elapsed
        })
      }
      break

    case 'reference':
      // 参考来源
      if (data.references && data.references.length > 0) {
        // 去重：使用 id 或 index 作为唯一标识
        // 注意：同一文档的不同片段有不同的 id 和 index，不应去重
        const uniqueRefs = data.references.reduce((acc, ref) => {
          // 使用 id 作为主要唯一标识，如果没有 id 则使用 index
          const key = ref.id || `${ref.doc_id || ref.doc_biz_id}_${ref.index}`

          // 检查是否已存在
          const isDuplicate = acc.some(r => {
            const existingKey = r.id || `${r.doc_id || r.doc_biz_id}_${r.index}`
            return existingKey === key
          })

          if (!isDuplicate) {
            acc.push(ref)
          }
          return acc
        }, [])

        // 保存用于显示的参考来源卡片
        currentSources = uniqueRefs.map(ref => {
          // 优先使用 name，如果没有则使用 doc_name 并移除 .pdf 后缀
          let title = ref.name || ref.doc_name || '参考来源'
          if (!ref.name && ref.doc_name) {
            title = ref.doc_name.replace(/\.pdf$/i, '')
          }

          return {
            title: title,
            description: ref.url || '',
            url: ref.url || '',
            index: ref.index
          }
        })
        currentAIMessage.sources = currentSources

        // 同时保存原始references用于角标显示
        currentAIMessage.references = uniqueRefs

        // 如果消息已完成，但参考来源后到，需要重新检查并可能追加提示
        if (currentAIMessage.isFinal) {
          const hasLocalStandardReference = uniqueRefs.some(ref => {
            const fileName = ref.name || ref.doc_name || ''
            return fileName.includes('DB') || fileName.includes('市')
          })

          if (hasLocalStandardReference && currentAIMessage.content && !currentAIMessage.content.includes('注：地方标准仅适用于发布地区')) {
            currentAIMessage.content = currentAIMessage.content.trim() + '\n\n注：地方标准仅适用于发布地区，使用时请注意适用范围。'
            console.log('📌 在 reference 事件中检测到地方标准文件，已追加提示')
          }
        }

        // 强制触发Vue的响应式更新 - 使用splice确保数组变更被检测
        if (messageIndex >= 0 && messageIndex < messages.value.length) {
          const updatedMessage = { ...currentAIMessage }
          messages.value.splice(messageIndex, 1, updatedMessage)

          console.log('📨 流式更新:', {
            is_final: data.is_final,
            content_length: currentAIMessage.content ? currentAIMessage.content.length : 0,
            message_index: messageIndex,
            content_preview: currentAIMessage.content && currentAIMessage.content.length > 50 ? currentAIMessage.content.substring(0, 50) + '...' : (currentAIMessage.content || '')
          })
        } else {
          console.error('❌ 消息索引无效:', messageIndex, 'messages长度:', messages.value.length)
        }

        console.log('📚 参考来源处理:', {
          原始数量: data.references.length,
          去重后数量: uniqueRefs.length,
          sources: currentSources,
          isFinal: currentAIMessage.isFinal,
          hasQuoteInfos: !!(currentAIMessage.quoteInfos && currentAIMessage.quoteInfos.length > 0),
          references: uniqueRefs.map(r => ({
            index: r.index,
            type: r.type,
            name: r.name?.substring(0, 50) + (r.name?.length > 50 ? '...' : '')
          }))
        })
      }
      break

    case 'recommended':
      // 推荐问题
      console.log('📥 收到 recommended 事件:', data)

      if (data.recommendeds && data.recommendeds.length > 0) {
        currentAIMessage.recommendeds = data.recommendeds.map(item => item.question)
        // 使用splice强制触发Vue响应式更新
        if (messageIndex >= 0 && messageIndex < messages.value.length) {
          const updatedMessage = { ...currentAIMessage }
          messages.value.splice(messageIndex, 1, updatedMessage)
        }

        console.log('💡 推荐问题已保存:', {
          messageIndex: messageIndex,
          count: currentAIMessage.recommendeds.length,
          questions: currentAIMessage.recommendeds,
          message: currentAIMessage
        })
      } else {
        console.warn('⚠️ recommendeds 为空或不存在:', data)
      }
      break

    case 'token_stat':
      // Token 统计和流程状态
      console.log('📊 Token 统计:', {
        token_count: data.token_count,
        elapsed: data.elapsed,
        procedures: data.procedures?.map(p => p.title)
      })

      // 不再动态更新思考状态，保持初始状态（联网搜索中/思考中）
      // 只记录日志用于调试
      if (data.procedures && data.procedures.length > 0) {
        console.log('🔄 流程状态:', data.procedures.map(p => `${p.name}(${p.status})`).join(', '))

        // 记录 knowledge 文档数量（仅用于调试）
        data.procedures.forEach((procedure) => {
          if (procedure.debugging?.knowledge && procedure.debugging.knowledge.length > 0) {
            console.log(`📖 ${procedure.name} 包含 ${procedure.debugging.knowledge.length} 个文档`)
          }
        })
      }
      break

    case 'error':
      // 错误处理
      const errorMsg = getErrorMessage(data.code)
      currentAIMessage.content = `**错误 (${data.code})**\n\n${errorMsg}\n\n${data.message || ''}`
      currentAIMessage.isFinal = true
      currentAIMessage.isPrintAnimate = false
      messages.value[messageIndex] = { ...currentAIMessage }
      sending.value = false

      console.error('❌ 错误:', data.code, errorMsg)
      break
  }
}

// 停止生成
const stopGeneration = () => {
  console.log('🛑 开始停止生成...')

  if (cancelCurrentRequest) {
    cancelCurrentRequest()
    cancelCurrentRequest = null
  }

  sending.value = false

  // 找到最后一条AI消息（不管是否完成）
  let messageIndex = -1
  for (let i = messages.value.length - 1; i >= 0; i--) {
    if (!messages.value[i].isUser) {
      messageIndex = i
      break
    }
  }

  console.log('📍 找到最后一条AI消息索引:', messageIndex)

  if (messageIndex !== -1) {
    const message = messages.value[messageIndex]
    console.log('📝 当前消息状态:', {
      hasContent: !!message.content,
      content: message.content,
      contentLength: message.content?.length,
      hasThought: !!message.thought,
      thought: message.thought
    })

    // 如果没有内容，添加提示
    const newContent = (!message.content || message.content.trim() === '')
      ? '⏹️ 已停止生成'
      : message.content

    console.log('🔄 准备更新内容:', newContent)

    // 强制更新消息状态 - 创建全新对象
    messages.value.splice(messageIndex, 1, {
      content: newContent,
      isUser: false,
      timestamp: message.timestamp || new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      isFinal: true,
      isPrintAnimate: false,
      isMdExpand: false,
      thought: null,  // 明确设置为 null
      sources: message.sources || [],
      quoteInfos: message.quoteInfos || [],
      references: message.references || [],
      recommendeds: message.recommendeds || []
    })

    console.log('✅ 消息已更新，thought 已清除')
  }

  // 清空当前消息引用
  currentAIMessage = null
  currentThought = null

  console.log('⏹️ 停止生成完成')
}

// 清空聊天记录
const handleClear = () => {
  if (!confirm('确认清空所有聊天记录吗？')) {
    return
  }

  console.log('🗑️ 清空聊天记录')

  // 停止当前请求
  stopGeneration()

  // 生成新的会话 ID
  sessionId.value = generateSessionId()

  // 清空消息
  messages.value = []

  console.log('📋 新会话 ID:', sessionId.value)
}

// 点赞
const handleLike = (message) => {
  console.log('👍 点赞消息', message)
  // TODO: 调用点赞 API
}

// 踩
const handleDislike = (message) => {
  console.log('👎 踩消息', message)
  // TODO: 调用踩 API
}

// 重新生成
const handleRefreshMessage = (message) => {
  console.log('🔄 重新生成消息')

  // 找到该消息的索引
  const index = messages.value.indexOf(message)
  if (index > 0) {
    // 获取上一条用户消息
    const prevMessage = messages.value[index - 1]
    if (prevMessage.isUser) {
      // 删除当前 AI 消息
      messages.value.splice(index, 1)
      // 重新发送
      handleSend(prevMessage.content)
    }
  }
}

// 更新用户消息
const handleUpdateUserMessage = ({ index, content }) => {
  console.log('✏️ 更新用户消息', { index, content })

  if (index >= 0 && index < messages.value.length) {
    // 更新用户消息内容
    messages.value[index].content = content

    // 如果后面有 AI 回复，删除它并重新生成
    if (index + 1 < messages.value.length && !messages.value[index + 1].isUser) {
      // 删除后面的所有消息（可能有多轮对话）
      messages.value.splice(index + 1)
      // 重新发送更新后的消息
      handleSend(content)
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
}

#app {
  height: 100vh;
  overflow: hidden;
}
</style>
