<template>
  <div class="ai-message-wrapper">
    <div class="avatar">
      <img src="../img/logo.png" alt="AI" class="avatar-img" />
    </div>

    <div class="message-content">
      <div class="message-bubble" :class="{ 'loading-bubble': !content }">
        <!-- 思考内容 - 暂时使用自定义组件避免Vue警告 -->
        <div v-if="thought" class="thought-container">
          <div class="thought-header">
            <span class="thought-title">{{ thought.title }}</span>
            <span class="thought-status" :class="thought.status">{{ thought.status === 'processing' ? '进行中...' : '已完成'
            }}</span>
          </div>
          <div v-if="thought.content && thought.detailVisible !== false" class="thought-content">
            {{ thought.content }}
          </div>
          <div v-if="thought.elapsed" class="thought-elapsed">
            耗时: {{ thought.elapsed }}ms
          </div>
        </div>


        <!-- 消息内容（带角标） -->
        <MsgContent v-if="content" :content="contentWithQuotes" :is-final="isFinal" :is-print-animate="isPrintAnimate"
          :is-md-expand="isMdExpand" />

        <!-- 引用来源区域：只在流式输出完成后显示 -->
        <div v-if="isFinal && sources && sources.length > 0" class="sources-section">
          <div class="sources-title">参考来源：</div>
          <SourceCard v-for="(source, idx) in filteredSources" :key="idx"
            :index="Number.isFinite(Number(source.index)) ? Number(source.index) : getSourceIndex(idx)"
            :title="source.title" :description="source.description" :url="source.url" />
        </div>

        <!-- 推荐问题区域：只在最新消息显示 -->
        <div v-if="isLatest && recommendeds && recommendeds.length > 0" class="recommended-section">
          <div class="recommended-title">相关问题</div>
          <div class="recommended-list">
            <button v-for="(question, idx) in recommendeds" :key="idx" class="recommended-item"
              @click="$emit('askQuestion', question)">
              {{ question }}
            </button>
          </div>
        </div>
      </div>

      <!-- AI消息时间 - 显示在气泡下方 -->
      <div v-if="timestamp" class="ai-time">{{ timestamp }}</div>

      <!-- AI消息操作按钮 -->
      <div class="message-actions">
        <button class="action-btn" @click="$emit('copy')" title="复制">
          <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor"
              d="M832 64H296c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h496v688c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V96c0-17.7-14.3-32-32-32zM704 192H192c-17.7 0-32 14.3-32 32v530.7c0 8.5 3.4 16.6 9.4 22.6l173.3 173.3c2.2 2.2 4.7 4 7.4 5.5v1.9h4.2c3.5 1.3 7.2 2 11 2H704c17.7 0 32-14.3 32-32V224c0-17.7-14.3-32-32-32zM350 856.2L263.9 770H350v86.2zM664 888H414V746c0-22.1-17.9-40-40-40H232V264h432v624z" />
          </svg>
        </button>

        <button class="action-btn" @click="$emit('refresh')" title="重新生成">
          <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor"
              d="M909.1 209.3l-56.4 44.1C775.8 155.1 656.2 92 521.9 92 290 92 102.3 279.5 102 511.5 101.7 743.7 289.8 932 521.9 932c181.3 0 335.8-115 394.6-276.1 1.5-4.2-.7-8.9-4.9-10.3l-56.7-19.5a8 8 0 0 0-10.1 4.8c-1.8 5-3.8 10-5.9 14.9-17.3 41-42.1 77.8-73.7 109.4A344.77 344.77 0 0 1 655.9 840c-42.7 17.9-88.1 27-134.9 27-46.5 0-91.5-9.1-134.2-27A341.5 341.5 0 0 1 279 755.2a342.16 342.16 0 0 1-84.6-107.3c-17.9-42.4-27-87.4-27-133.9s9.1-91.5 27-133.9c17.3-41 42.1-77.8 73.7-109.4A342.16 342.16 0 0 1 376.4 187c42.7-17.9 87.7-27 134.2-27 46.8 0 92.2 9.2 134.9 27 41.3 17.3 78.4 42 110.1 73.5a344.77 344.77 0 0 1 73.7 109.4c9.1 21.5 15.6 44.2 19.4 67.4l-63.1-49.4c-3.7-2.9-9.1-.7-10.1 4l-17.2 85.3c-1.1 5.5 3.5 10.2 9.2 9.2l85.3-17.2c4.7-1 6.9-6.4 4-10.1z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MsgContent } from 'lke-component-vue3'
import SourceCard from './SourceCard.vue'
import { computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: String,
    default: ''
  },
  isFinal: {
    type: Boolean,
    default: true
  },
  isPrintAnimate: {
    type: Boolean,
    default: false
  },
  isMdExpand: {
    type: Boolean,
    default: false
  },
  thought: {
    type: Object,
    default: null
  },
  sources: {
    type: Array,
    default: () => []
  },
  quoteInfos: {
    type: Array,
    default: () => []
  },
  references: {
    type: Array,
    default: () => []
  },
  recommendeds: {
    type: Array,
    default: () => []
  },
  isLatest: {
    type: Boolean,
    default: false
  }
})

defineEmits(['copy', 'like', 'dislike', 'refresh', 'askQuestion'])

// 过滤出实际被引用的来源（quoteInfos 缺失/不匹配时回退为全量 sources）
const filteredSources = computed(() => {
  if (!props.sources || props.sources.length === 0) return []

  const sourcesSorted = [...props.sources].sort((a, b) => Number(a.index ?? 0) - Number(b.index ?? 0))
  if (!props.quoteInfos || props.quoteInfos.length === 0) return sourcesSorted

  const quotedIndices = new Set(props.quoteInfos.map(q => String(q.index)))
  const filtered = sourcesSorted.filter(source => quotedIndices.has(String(source.index)))
  return filtered.length > 0 ? filtered : sourcesSorted
})

// 获取参考来源的序号
const getSourceIndex = (idx) => {
  // 如果有 references 数据，从中获取 index
  if (props.references && props.references[idx]) {
    return props.references[idx].index || (idx + 1)
  }
  // 否则使用默认序号
  return idx + 1
}

// 计算带角标的内容 - 使用纯文本上标格式
const contentWithQuotes = computed(() => {
  if (!props.content || !props.quoteInfos || props.quoteInfos.length === 0) {
    return props.content
  }

  // 按position排序（从后往前插入,避免位置偏移）
  // 同一位置时按index降序排列，因为是从后往前插入，所以大的先插入，最终显示时小的在前
  const sortedQuotes = [...props.quoteInfos].sort((a, b) => {
    if (b.position !== a.position) {
      return b.position - a.position
    }
    return b.index - a.index
  })

  let result = props.content
  sortedQuotes.forEach(quote => {
    const position = Number(quote.position)
    const index = quote.index
    if (!Number.isFinite(position)) return

    // 使用Unicode上标数字字符
    const superscriptMap = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
    }

    const superscriptIndex = String(index)
      .split('')
      .map(digit => superscriptMap[digit] || digit)
      .join('')

    // 在指定位置插入Unicode上标角标
    if (position <= result.length) {
      let insertPos = Math.max(0, Math.min(position, result.length))

      // 兼容后端 position 可能为“末尾字符索引(0-based)”，导致角标插在最后一个字前面的问题：
      // 若当前位置字符不是空白/标点，则认为需要插在该字符之后。
      if (insertPos < result.length) {
        const currentChar = result.charAt(insertPos)
        const isBoundary = /[\s\r\n\t，。！？；：、,.!?;:)\]】）”’"'»]/.test(currentChar)
        if (!isBoundary) insertPos += 1
      }

      const before = result.substring(0, insertPos)
      const after = result.substring(insertPos)
      result = `${before}⁽${superscriptIndex}⁾${after}`
    }
  })

  return result
})
</script>

<style scoped>
.ai-message-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 0;
  align-items: flex-start;
  width: 100%;
}

.avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 4px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  min-width: 100px;
  align-items: flex-start;
}


.ai-time {
  font-size: 11px;
  color: #999;
  margin-top: 6px;
  text-align: left;
}

.message-bubble {
  background: #f7f8fa;
  border-radius: 12px;
  padding: 12px 16px;
  display: inline-block;
  width: fit-content;
  max-width: 100%;
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .ai-message-wrapper {
    gap: 10px;
    margin-bottom: 14px;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    padding: 3px;
    box-shadow: none;
  }

  .message-content {
    flex: 1;
    max-width: none;
    min-width: 0;
  }

  .message-bubble {
    background: transparent;
    padding: 0;
    border-radius: 0;
    display: block;
    width: 100%;
    font-size: 13px;
    line-height: 1.65;
  }

  .message-bubble.loading-bubble {
    padding: 8px 0;
  }

  .ai-time {
    font-size: 10px;
    margin-top: 4px;
  }

  .thought-container {
    margin-bottom: 10px;
    padding: 10px;
    font-size: 12px;
  }

  .thought-header {
    gap: 6px;
    margin-bottom: 6px;
  }

  .thought-status {
    font-size: 11px;
    padding: 1px 6px;
  }

  .thought-content {
    font-size: 11px;
    line-height: 1.45;
  }

  .thought-elapsed {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .ai-message-wrapper {
    gap: 8px;
    margin-bottom: 12px;
  }

  .avatar {
    width: 28px;
    height: 28px;
  }

  .message-bubble {
    font-size: 12px;
  }

  .message-bubble.loading-bubble {
    padding: 6px 0;
  }

  .action-btn {
    padding: 5px 10px;
    font-size: 12px;
  }

  .action-btn svg {
    width: 13px;
    height: 13px;
  }
}


.loading-bubble {
  min-height: 40px;
  display: flex;
  align-items: center;
  padding: 16px 20px;
}

/* 打字加载动画 */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 20px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: typing 1.4s infinite;
  opacity: 0.6;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {

  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.6;
  }

  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.sources {
  margin-top: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.sources-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
  font-weight: 600;
}

.sources-header .icon {
  width: 16px;
  height: 16px;
  color: #667eea;
}

.sources-section {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 13px;
  line-height: 1.8;
}

.sources-title {
  color: #666;
  font-weight: 500;
  margin-right: 4px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .sources-section {
    margin-top: 10px;
    padding-top: 10px;
    font-size: 12px;
    line-height: 2;
  }

  .sources-title {
    font-size: 12px;
    margin-bottom: 4px;
  }
}

@media (max-width: 480px) {
  .sources-section {
    margin-top: 12px;
    padding-top: 12px;
    font-size: 12px;
    line-height: 2;
  }

  .sources-title {
    display: block;
    margin-bottom: 8px;
    font-size: 12px;
  }
}

.recommended-section {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.recommended-title {
  font-size: 13px;
  color: #666;
  font-weight: 500;
  margin-bottom: 10px;
}

.recommended-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recommended-item {
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  padding: 10px 14px;
  text-align: left;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1.5;
}

.recommended-item:hover {
  background: linear-gradient(135deg, #e8ebff 0%, #f5f7ff 100%);
  border-color: #667eea;
  color: #667eea;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}

.recommended-item:active {
  transform: translateX(2px);
}

/* 思考组件样式 */
.thought-container {
  margin-bottom: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f2ff 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  font-size: 13px;
}

.thought-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.thought-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.thought-title {
  font-weight: 500;
  color: #333;
}

.thought-status {
  margin-left: auto;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.thought-status.processing {
  background: rgba(255, 165, 0, 0.1);
  color: #ff8c00;
}

.thought-status.success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.thought-content {
  color: #666;
  font-size: 12px;
  line-height: 1.4;
  margin-bottom: 6px;
}

.thought-elapsed {
  font-size: 11px;
  color: #999;
  text-align: right;
}

/* 移动端适配 - 推荐问题 */
@media (max-width: 768px) {
  .recommended-section {
    margin-top: 14px;
    padding-top: 10px;
  }

  .recommended-title {
    font-size: 12px;
  }

  .recommended-item {
    padding: 10px 12px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .recommended-section {
    margin-top: 16px;
    padding-top: 12px;
  }

  .recommended-title {
    font-size: 12px;
    margin-bottom: 12px;
  }

  .recommended-item {
    padding: 10px 12px;
    font-size: 13px;
    min-height: 44px;
    display: flex;
    align-items: center;
  }
}

.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 6px 12px;
  border: 1px solid #e8e8e8;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: #667eea;
  color: #667eea;
  background: #f7f8ff;
}

.action-btn svg {
  width: 14px;
  height: 14px;
}

/* 修复 MsgContent 内部列表样式 */
:deep(.msg-content) {
  white-space: normal;
}

:deep(.msg-content p) {
  margin: 8px 0;
  line-height: 1.7;
}

:deep(.msg-content h1),
:deep(.msg-content h2),
:deep(.msg-content h3),
:deep(.msg-content h4),
:deep(.msg-content h5),
:deep(.msg-content h6) {
  margin: 14px 0 8px;
  line-height: 1.35;
}

:deep(.msg-content > :first-child) {
  margin-top: 0;
}

:deep(.msg-content > :last-child) {
  margin-bottom: 0;
}

:deep(ol),
:deep(ul) {
  padding-left: 20px;
  margin: 8px 0;
}

:deep(li) {
  margin: 6px 0;
  line-height: 1.7;
  white-space: normal;
  word-break: break-word;
}

:deep(li strong) {
  display: inline;
  margin-right: 0;
}

:deep(li p) {
  display: inline !important;
  margin: 0 !important;
  padding: 0 !important;
}

:deep(li br) {
  display: none;
}

/* 修复列表项内容换行和间距 */
:deep(ol > li),
:deep(ul > li) {
  padding-left: 0;
  text-indent: 0;
  white-space: normal;
}

:deep(li > *) {
  display: inline !important;
  white-space: normal;
}
</style>

<style>
/* 全局样式修复列表显示问题 - 针对所有可能的容器 */
.message-bubble .msg-content,
.msg-content {
  white-space: normal !important;
}

.message-bubble p,
.msg-content p {
  margin: 8px 0 !important;
  line-height: 1.7 !important;
}

.message-bubble h1,
.message-bubble h2,
.message-bubble h3,
.message-bubble h4,
.message-bubble h5,
.message-bubble h6,
.msg-content h1,
.msg-content h2,
.msg-content h3,
.msg-content h4,
.msg-content h5,
.msg-content h6 {
  margin: 14px 0 8px !important;
  line-height: 1.35 !important;
}

.message-bubble ol,
.message-bubble ul,
.msg-content ol,
.msg-content ul {
  padding-left: 20px !important;
  margin: 8px 0 !important;
}

.message-bubble li,
.msg-content li {
  margin: 6px 0 !important;
  line-height: 1.7 !important;
  white-space: normal !important;
  display: list-item !important;
}

.message-bubble li strong,
.message-bubble li b,
.msg-content li strong,
.msg-content li b {
  display: inline !important;
  margin: 0 !important;
  padding: 0 !important;
  font-weight: 600 !important;
}

.message-bubble li p,
.msg-content li p {
  display: inline !important;
  margin: 0 !important;
  padding: 0 !important;
}

.message-bubble li br,
.msg-content li br {
  display: none !important;
}

.message-bubble li>*:not(ol):not(ul),
.msg-content li>*:not(ol):not(ul) {
  display: inline !important;
}

@media (max-width: 768px) {

  .message-bubble p,
  .msg-content p {
    margin: 6px 0 !important;
  }

  .message-bubble h1,
  .message-bubble h2,
  .message-bubble h3,
  .message-bubble h4,
  .message-bubble h5,
  .message-bubble h6,
  .msg-content h1,
  .msg-content h2,
  .msg-content h3,
  .msg-content h4,
  .msg-content h5,
  .msg-content h6 {
    margin: 12px 0 6px !important;
  }

  .message-bubble li,
  .msg-content li {
    margin: 5px 0 !important;
    line-height: 1.65 !important;
  }
}

@media (max-width: 480px) {

  .message-bubble p,
  .msg-content p {
    margin: 5px 0 !important;
  }

  .message-bubble h1,
  .message-bubble h2,
  .message-bubble h3,
  .message-bubble h4,
  .message-bubble h5,
  .message-bubble h6,
  .msg-content h1,
  .msg-content h2,
  .msg-content h3,
  .msg-content h4,
  .msg-content h5,
  .msg-content h6 {
    margin: 10px 0 5px !important;
  }
}
</style>
