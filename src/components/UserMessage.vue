<template>
  <div class="user-message-wrapper">
    <div class="user-message-content">
      <!-- 用户消息时间 - 显示在气泡上方 -->
      <div v-if="timestamp" class="user-time-top">{{ timestamp }}</div>

      <!-- 正常显示模式 -->
      <div v-if="!isEditing" class="user-message-bubble-container">
        <div class="user-message-bubble">
          {{ content }}
        </div>

        <!-- 操作按钮 -->
        <div class="message-actions">
          <button @click="handleCopy" class="action-btn" title="复制">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button @click="startEdit" class="action-btn" title="编辑">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- 编辑模式 -->
      <div v-else class="edit-container">
        <textarea
          ref="editTextarea"
          v-model="editedContent"
          class="edit-textarea"
          @keydown.esc="cancelEdit"
        ></textarea>

        <div class="edit-actions">
          <button @click="cancelEdit" class="edit-btn cancel-btn">Cancel</button>
          <button @click="saveEdit" class="edit-btn update-btn">Update</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  timestamp: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update', 'copy'])

const isEditing = ref(false)
const editedContent = ref('')
const editTextarea = ref(null)

// 开始编辑
const startEdit = () => {
  editedContent.value = props.content
  isEditing.value = true

  // 等待 DOM 更新后自动聚焦并调整高度
  nextTick(() => {
    if (editTextarea.value) {
      editTextarea.value.focus()
      adjustTextareaHeight()
    }
  })
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  editedContent.value = ''
}

// 保存编辑
const saveEdit = () => {
  if (editedContent.value.trim()) {
    emit('update', editedContent.value.trim())
    isEditing.value = false
  }
}

// 复制内容
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.content)
    emit('copy', props.content)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 自动调整 textarea 高度
const adjustTextareaHeight = () => {
  if (editTextarea.value) {
    editTextarea.value.style.height = 'auto'
    editTextarea.value.style.height = editTextarea.value.scrollHeight + 'px'
  }
}
</script>

<style scoped>
.user-message-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
  padding: 0;
  width: 100%;
}

.user-message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  min-width: 100px;
  align-items: flex-end;
}

.user-time-top {
  font-size: 11px;
  color: rgba(102, 126, 234, 0.6);
  margin-bottom: 6px;
  text-align: right;
}

/* 消息气泡容器 */
.user-message-bubble-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;
}

.user-message-bubble {
  background: rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
  color: #333;
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  padding: 10px 14px;
  display: inline-block;
  width: fit-content;
  max-width: 100%;
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
  min-height: fit-content;
  font-size: 14px;
  line-height: 1.6;
}

/* 操作按钮 */
.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.user-message-bubble-container:hover .message-actions {
  opacity: 1;
}

.action-btn {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 6px;
  padding: 6px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: rgba(102, 126, 234, 0.8);
}

.action-btn:hover {
  background: rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.4);
  color: rgba(102, 126, 234, 1);
}

.action-btn:active {
  transform: scale(0.95);
}

/* 编辑模式 */
.edit-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-textarea {
  background: rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
  color: #333;
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  padding: 10px 14px;
  width: 100%;
  min-height: 60px;
  max-height: 300px;
  font-size: 14px;
  line-height: 1.6;
  font-family: inherit;
  resize: none;
  overflow-y: auto;
  box-sizing: border-box;
}

.edit-textarea:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

/* 编辑按钮 */
.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.edit-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-weight: 500;
}

.cancel-btn {
  background: transparent;
  color: rgba(102, 126, 234, 0.8);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.cancel-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
}

.update-btn {
  background: rgba(102, 126, 234, 0.8);
  color: white;
}

.update-btn:hover {
  background: rgba(102, 126, 234, 1);
}

.update-btn:active,
.cancel-btn:active {
  transform: scale(0.98);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .user-message-content {
    max-width: 88%;
  }

  .user-message-bubble {
    font-size: 13px;
  }

  .edit-textarea {
    font-size: 13px;
  }

  .message-actions {
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .user-message-content {
    max-width: 92%;
  }

  .user-message-bubble {
    padding: 8px 12px;
    font-size: 13px;
  }

  .user-time-top {
    font-size: 10px;
  }

  .edit-textarea {
    padding: 8px 12px;
    font-size: 13px;
  }

  .edit-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>
