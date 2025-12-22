<template>
  <div class="chat-input-wrapper">
    <div class="input-actions">
      <button class="clear-btn" @click="$emit('clear')" title="清空对话">
        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"/>
        </svg>
      </button>
      
      <div class="input-container">
        <div class="input-box">
          <textarea
            v-model="inputText"
            class="input-textarea"
            :placeholder="placeholder"
            @keydown.enter="handleEnter"
            ref="textareaRef"
            rows="1"
          ></textarea>
        </div>
        
        <button 
          class="search-toggle-btn" 
          :class="{ active: searchNetwork === 'enable' }"
          @click="$emit('toggleSearchNetwork')" 
          :title="searchNetwork === 'enable' ? '联网搜索已开启' : '联网搜索已关闭'"
        >
          <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M512 128C300.8 128 128 300.8 128 512s172.8 384 384 384 384-172.8 384-384S723.2 128 512 128zm0 85.333c66.133 0 128 23.467 174.933 61.867L217.6 744.533C179.2 697.6 170.667 635.733 170.667 569.6c0-187.733 153.6-341.333 341.333-341.333zm0 597.334c-66.133 0-128-23.467-174.933-61.867L806.4 279.467C844.8 326.4 853.333 388.267 853.333 454.4c0 187.733-153.6 341.333-341.333 341.333z"/>
          </svg>
          <span class="btn-text">{{ searchNetwork === 'enable' ? '联网' : '不联网' }}</span>
        </button>
        
        <button
          class="send-btn"
          :class="{ 'stop-btn': sending }"
          :disabled="!sending && !inputText.trim()"
          @click="sending ? $emit('stop') : handleSend()"
          :title="sending ? '停止生成' : '发送消息'"
        >
          <!-- 发送图标 -->
          <svg v-if="!sending" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M931.4 498.9L94.9 79.5c-3.4-1.7-7.3-2.1-11-1.2a15.99 15.99 0 0 0-11.7 19.3l86.2 352.2c1.3 5.3 5.2 9.6 10.4 11.3l147.7 50.7-147.6 50.7c-5.2 1.8-9.1 6-10.3 11.3L72.2 926.5c-.9 3.7-.5 7.6 1.2 10.9 3.9 7.9 13.5 11.1 21.5 7.2l836.5-417c3.1-1.5 5.6-4.1 7.2-7.1 3.9-8 .7-17.6-7.2-21.6zM170.8 826.3l50.3-205.6 295.2-101.3c2.3-.8 4.2-2.6 5-5 1.4-4.2-.8-8.7-5-10.2L221.1 403 171 198.2l628 314.9-628.2 313.2z"/>
          </svg>
          <!-- 停止图标 -->
          <svg v-else viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"/>
            <path fill="currentColor" d="M464 688V336c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v352c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8zm104 0V336c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v352c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: '请输入你的问题...'
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

const emit = defineEmits(['send', 'stop', 'toggleSearchNetwork', 'clear'])

const inputText = ref('')
const textareaRef = ref(null)

const handleSend = () => {
  if (inputText.value.trim() && !props.sending) {
    emit('send', inputText.value.trim())
    inputText.value = ''
    autoResize()
  }
}

const handleEnter = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

const autoResize = () => {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
    }
  })
}

watch(inputText, () => {
  autoResize()
})
</script>

<style scoped>
.chat-input-wrapper {
  padding: 20px 24px 24px;
  background: transparent;
  border-top: none;
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.clear-btn {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.clear-btn:hover {
  background: #fff1f0;
  border-color: #ff4d4f;
  color: #ff4d4f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.2);
}

.clear-btn svg {
  width: 18px;
  height: 18px;
}

.search-toggle-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: none;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 16px;
  cursor: pointer;
  color: #666;
  font-size: 12px;
  transition: all 0.2s;
  height: 32px;
}

.search-toggle-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.search-toggle-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.search-toggle-btn.active:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a3f92 100%);
}

.search-toggle-btn .icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.search-toggle-btn .btn-text {
  font-weight: 500;
  white-space: nowrap;
}

.input-container {
  flex: 1;
  display: flex;
  gap: 8px;
  align-items: center;
  background: white;
  border-radius: 24px;
  padding: 8px 8px 8px 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.input-container:focus-within {
  border-color: #667eea;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.2);
}

.input-box {
  flex: 1;
  min-width: 0;
}

.input-textarea {
  width: 100%;
  min-height: 24px;
  max-height: 200px;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  font-family: inherit;
}

.input-textarea::placeholder {
  color: #999;
}

.send-btn {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.send-btn.stop-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.send-btn.stop-btn:hover {
  background: linear-gradient(135deg, #ff5252 0%, #e04d5f 100%);
  box-shadow: 0 6px 16px rgba(255, 107, 107, 0.4);
}

.send-btn svg {
  width: 18px;
  height: 18px;
}

.loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .chat-input-wrapper {
    padding: 16px 12px 20px;
  }

  .input-actions {
    gap: 8px;
  }

  .clear-btn {
    width: 36px;
    height: 36px;
  }

  .search-toggle-btn {
    padding: 4px 8px;
    height: 28px;
    font-size: 11px;
  }

  .search-toggle-btn .icon {
    width: 14px;
    height: 14px;
  }

  .image-preview-container {
    max-width: 100%;
    padding: 2px;
  }

  .image-preview-item {
    width: 50px;
    height: 50px;
  }

  .image-btn {
    width: 32px;
    height: 32px;
  }

  .image-btn svg {
    width: 18px;
    height: 18px;
  }

  .send-btn {
    width: 36px;
    height: 36px;
  }

  .send-btn svg {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 480px) {
  .chat-input-wrapper {
    padding: 12px 8px 16px;
  }

  .input-actions {
    gap: 6px;
  }

  .clear-btn {
    width: 32px;
    height: 32px;
  }

  .clear-btn svg {
    width: 16px;
    height: 16px;
  }

  .image-preview-container {
    gap: 6px;
  }

  .image-preview-item {
    width: 45px;
    height: 45px;
  }

  .input-container {
    padding: 6px 6px 6px 12px;
  }

  .input-textarea {
    font-size: 15px;
  }
}
</style>
