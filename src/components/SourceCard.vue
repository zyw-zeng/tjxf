<template>
  <a :href="url || '#'" :target="url ? '_blank' : '_self'" class="source-link" @click="handleClick">
    <span class="source-index">[{{ index }}]</span>
    <span class="source-text">{{ title }}</span>
  </a>
</template>

<script setup>
defineProps({
  index: {
    type: Number,
    default: 1
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    default: ''
  }
})

const handleClick = (e) => {
  // 如果没有URL，阻止默认行为
  if (!e.currentTarget.getAttribute('href') || e.currentTarget.getAttribute('href') === '#') {
    e.preventDefault()
  }
}
</script>

<style scoped>
.source-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: transparent;
  color: #667eea;
  text-decoration: none;
  border-radius: 4px;
  font-size: 13px;
  transition: all 0.2s;
  border: none;
  min-height: 32px;
}

.source-link:hover {
  background: rgba(102, 126, 234, 0.1);
  text-decoration: underline;
}

.source-link:active {
  background: rgba(102, 126, 234, 0.15);
}

.source-index {
  flex-shrink: 0;
  font-weight: 600;
  font-size: 12px;
  color: #667eea;
}

.source-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 500px;
  font-weight: 400;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .source-link {
    padding: 6px 10px;
    font-size: 12px;
    gap: 3px;
    min-height: 36px;
    border-radius: 6px;
  }

  .source-index {
    font-size: 11px;
  }

  .source-text {
    max-width: 200px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .source-link {
    padding: 8px 12px;
    font-size: 13px;
    min-height: 40px;
    border-radius: 8px;
    margin: 2px 0;
  }

  .source-index {
    font-size: 12px;
    font-weight: 700;
  }

  .source-text {
    max-width: 200px;
    font-size: 13px;
  }
}
</style>
