<template>
  <div class="chat-layout">
    <!-- 顶部Logo区域 -->
    <div class="top-header">
      <div class="logo-area">
        <img src="../img/logo.png" alt="Logo" class="logo-img" />
        <span class="app-name">消防科普知识库问答</span>
      </div>
    </div>

    <div class="chat-messages" ref="messagesRef">
      <div class="messages-container">
        <template v-for="(message, index) in messages" :key="index">
          <!-- 用户消息 -->
          <UserMessage v-if="message.isUser" :content="message.content" :timestamp="message.timestamp"
            @update="handleUpdateUserMessage(index, $event)" @copy="handleCopyUserMessage(message)" />

          <!-- AI消息 -->
          <ChatMessage v-else :content="message.content" :timestamp="message.timestamp" :isFinal="message.isFinal"
            :isPrintAnimate="message.isPrintAnimate" :isMdExpand="message.isMdExpand" :thought="message.thought"
            :sources="message.sources" :quoteInfos="message.quoteInfos || []" :references="message.references || []"
            :recommendeds="message.recommendeds || []" :isLatest="isLatestAIMessage(index)" @copy="handleCopy(message)"
            @like="handleLike(message)" @dislike="handleDislike(message)" @refresh="handleRefreshMessage(message)"
            @askQuestion="handleAskQuestion" />
        </template>
      </div>

      <div v-if="messages.length === 0" class="empty-state">
        <div class="logo-container">
          <img src="../img/logo.png" alt="Logo" class="logo-image" />
        </div>
        <h2 class="app-title">消防科普知识库问答</h2>
        <p class="app-subtitle">请输入您的问题，开始对话</p>
      </div>
    </div>

    <div class="input-wrapper">
      <ChatInput :sending="sending" :searchNetwork="searchNetwork" @send="handleSend" @stop="$emit('stop')"
        @clear="handleClear" @toggleSearchNetwork="$emit('toggleSearchNetwork')" />
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import ChatMessage from './ChatMessage.vue'
import UserMessage from './UserMessage.vue'
import ChatInput from './ChatInput.vue'

const props = defineProps({
  title: {
    type: String,
    default: '消防科普知识库问答'
  },
  messages: {
    type: Array,
    default: () => []
  },
  sending: {
    type: Boolean,
    default: false
  },
  searchNetwork: {
    type: String,
    default: 'disable'
  }
})

const emit = defineEmits([
  'send',
  'stop',
  'clear',
  'like',
  'dislike',
  'refreshMessage',
  'toggleSearchNetwork',
  'updateUserMessage'
])

const messagesRef = ref(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

watch(() => props.messages, () => {
  scrollToBottom()
}, { deep: true })

const handleSend = (text) => {
  emit('send', text)
}

const handleClear = () => {
  emit('clear')
}

const handleCopy = (message) => {
  navigator.clipboard.writeText(message.content)
  console.log('已复制')
}

const handleLike = (message) => {
  emit('like', message)
}

const handleDislike = (message) => {
  emit('dislike', message)
}

const handleRefreshMessage = (message) => {
  emit('refreshMessage', message)
}

const handleAskQuestion = (question) => {
  emit('send', question)
}

// 处理用户消息更新
const handleUpdateUserMessage = (index, newContent) => {
  emit('updateUserMessage', { index, content: newContent })
}

// 处理用户消息复制
const handleCopyUserMessage = (message) => {
  navigator.clipboard.writeText(message.content)
  console.log('已复制用户消息')
}

// 判断是否是最后一条AI消息
const isLatestAIMessage = (index) => {
  // 从当前索引往后查找，如果没有其他AI消息，则当前是最后一条
  for (let i = index + 1; i < props.messages.length; i++) {
    if (!props.messages[i].isUser) {
      return false // 后面还有AI消息
    }
  }
  return true // 当前是最后一条AI消息
}
</script>

<style scoped>
.chat-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(180deg, #e3f2fd 0%, #f0f4ff 50%, #fafbff 100%);
}

.top-header {
  padding: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.app-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: 0.5px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #b0b0b0;
}

.messages-container {
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 20px;
  max-width: 800px;
  width: 100%;
}

.logo-container {
  margin-bottom: 32px;
  animation: fadeInDown 0.6s ease-out;
}

.logo-image {
  width: 120px;
  height: auto;
  display: block;
}

.app-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  letter-spacing: 0.5px;
  animation: fadeInUp 0.6s ease-out 0.1s both;
}

.app-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.input-wrapper {
  display: flex;
  justify-content: center;
  padding: 0 20px;
}

.input-wrapper :deep(.chat-input-wrapper) {
  width: 100%;
  max-width: 1000px;
  padding: 20px 0 24px;
}

@media (max-width: 768px) {
  .chat-messages {
    padding: 16px 12px;
  }

  .input-wrapper {
    padding: 0 12px;
  }

  .input-wrapper :deep(.chat-input-wrapper) {
    padding: 14px 0 18px;
  }
}

@media (max-width: 480px) {
  .chat-messages {
    padding: 12px 10px;
  }

  .input-wrapper {
    padding: 0 10px;
  }
}
</style>
