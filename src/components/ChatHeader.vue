<template>
  <header class="chat-header">
    <div class="header-left">
      <div class="logo">
        <img src="../img/logo.png" alt="Logo" class="logo-img" />
      </div>
      <h1 class="title">{{ title }}</h1>
    </div>
    
    <div class="header-right">
      <button 
        class="search-toggle-btn" 
        :class="{ active: searchNetwork === 'enable' }"
        @click="$emit('toggleSearchNetwork')" 
        :title="searchNetwork === 'enable' ? '联网搜索已开启' : '联网搜索已关闭'"
      >
        <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M512 128C300.8 128 128 300.8 128 512s172.8 384 384 384 384-172.8 384-384S723.2 128 512 128zm0 85.333c66.133 0 128 23.467 174.933 61.867L217.6 744.533C179.2 697.6 170.667 635.733 170.667 569.6c0-187.733 153.6-341.333 341.333-341.333zm0 597.334c-66.133 0-128-23.467-174.933-61.867L806.4 279.467C844.8 326.4 853.333 388.267 853.333 454.4c0 187.733-153.6 341.333-341.333 341.333z"/>
        </svg>
        <span>{{ searchNetwork === 'enable' ? '联网' : '不联网' }}</span>
      </button>
      
      <button class="clear-btn" @click="$emit('clear')" title="清空聊天记录">
        <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"/>
        </svg>
        <span>清空</span>
      </button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '天津滨河知识库问答'
  },
  searchNetwork: {
    type: String,
    default: 'disable'
  }
})

defineEmits(['clear', 'toggleSearchNetwork'])
</script>

<style scoped>
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: transparent;
  border-bottom: none;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  gap: 8px;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
  font-size: 14px;
}

.clear-btn:hover {
  background: rgba(255, 241, 240, 0.9);
  border-color: #ff4d4f;
  color: #ff4d4f;
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.15);
}

.clear-btn .icon {
  width: 16px;
  height: 16px;
}

.search-toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
  font-size: 14px;
  position: relative;
}

.search-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-toggle-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.search-toggle-btn.active:hover {
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  transform: translateY(-1px);
}

.search-toggle-btn .icon {
  width: 16px;
  height: 16px;
}
</style>
