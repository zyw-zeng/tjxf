/**
 * SSE 聊天 API 服务
 * 基于腾讯云知识引擎 LKE 对话端接口
 */

// API 配置
const API_CONFIG = {
  baseURL: 'https://wss.lke.cloud.tencent.com/v1/qbot/chat/sse',
  timeout: 60000, // 60秒超时
}

/**
 * 发送 SSE 聊天请求
 * @param {Object} params - 请求参数
 * @param {string} params.content - 消息内容
 * @param {string} params.session_id - 会话ID
 * @param {string} params.bot_app_key - 应用密钥
 * @param {string} params.visitor_biz_id - 访客ID
 * @param {Function} onMessage - 消息回调函数
 * @param {Function} onError - 错误回调函数
 * @param {Function} onComplete - 完成回调函数
 * @returns {Function} 取消函数
 */
export function sendChatMessage(params, onMessage, onError, onComplete) {
  const {
    content,
    session_id,
    bot_app_key,
    visitor_biz_id,
    request_id = generateRequestId(),
    incremental = false,
    streaming_throttle = 5,
    model_name = '', // 可选：hunyuan, lke-deepseek-r1, lke-deepseek-v3 等
    search_network = '', // 可选：enable, disable
    system_role = '',
    custom_variables = {},
  } = params

  let abortController = new AbortController()
  let reader = null

  // 构建请求体
  const requestBody = {
    request_id,
    content,
    session_id,
    bot_app_key,
    visitor_biz_id,
    incremental,
    streaming_throttle,
  }

  // 添加可选参数
  if (model_name) requestBody.model_name = model_name
  // search_network: enable 启用联网搜索，disable 禁用联网搜索，空字符串跟随应用配置
  if (search_network && (search_network === 'enable' || search_network === 'disable')) {
    requestBody.search_network = search_network
  }
  if (system_role) requestBody.system_role = system_role
  if (Object.keys(custom_variables).length > 0) {
    requestBody.custom_variables = custom_variables
  }

  // 发起 SSE 请求
  fetch(API_CONFIG.baseURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
    signal: abortController.signal,
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.body
    })
    .then(body => {
      reader = body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      // 读取流数据
      function read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            if (onComplete) onComplete()
            return
          }

          // 解码数据
          buffer += decoder.decode(value, { stream: true })
          
          // 处理 SSE 消息 - 彻底重写避免所有变量冲突
          const messageLines = buffer.split('\n')
          buffer = messageLines.pop() // 保留不完整的行

          let eventType = null
          let eventData = ''

          for (let i = 0; i < messageLines.length; i++) {
            const currentLine = messageLines[i]
            
            if (currentLine.startsWith('event:')) {
              // 处理之前累积的数据
              if (eventType && eventData) {
                try {
                  const jsonData = JSON.parse(eventData)
                  handleSSEEvent(eventType, jsonData, onMessage)
                  console.log('✅ SSE 事件处理成功:', eventType, '数据长度:', eventData.length)
                } catch (parseError) {
                  console.error('❌ JSON 解析失败:', eventType, '数据长度:', eventData.length, '错误:', parseError.message)
                  if (eventData && eventData.length > 0) {
                    console.error('数据预览:', eventData.substring(0, Math.min(100, eventData.length)) + '...')
                  }
                }
              }
              
              eventType = currentLine.substring(6).trim()
              eventData = ''
            } else if (currentLine.startsWith('data:')) {
              const lineContent = currentLine.substring(5).trim()
              
              if (eventData) {
                // 多行数据累积
                eventData += '\n' + lineContent
              } else {
                eventData = lineContent
              }
            } else if (currentLine.trim() === '' && eventType && eventData) {
              // 空行表示消息结束
              try {
                const jsonData = JSON.parse(eventData)
                handleSSEEvent(eventType, jsonData, onMessage)
                console.log('✅ SSE 消息完成:', eventType, '数据长度:', eventData.length)
              } catch (parseError) {
                console.error('❌ 最终 JSON 解析失败:', eventType, '数据长度:', eventData.length, '错误:', parseError.message)
                if (eventData && eventData.length > 0) {
                  console.error('数据预览:', eventData.substring(0, Math.min(100, eventData.length)) + '...')
                }
              }
              eventType = null
              eventData = ''
            }
          }

          // 继续读取
          read()
        }).catch(err => {
          if (err.name !== 'AbortError') {
            console.error('Stream reading error:', err)
            if (onError) onError(err)
          }
        })
      }

      read()
    })
    .catch(err => {
      if (err.name !== 'AbortError') {
        console.error('Fetch error:', err)
        if (onError) onError(err)
      }
    })

  // 返回取消函数
  return () => {
    if (abortController) {
      abortController.abort()
    }
    if (reader) {
      reader.cancel()
    }
  }
}

/**
 * 处理 SSE 事件
 * @param {string} eventType - 事件类型
 * @param {Object} data - 事件数据
 * @param {Function} onMessage - 消息回调
 */
function handleSSEEvent(eventType, data, onMessage) {
  if (!onMessage) return

  const payload = data.payload || data

  switch (eventType) {
    case 'reply':
      // 回复事件
      onMessage({
        type: 'reply',
        data: {
          content: payload.content || '',
          is_final: payload.is_final || false,
          is_evil: payload.is_evil || false,
          record_id: payload.record_id || '',
          session_id: payload.session_id || '',
          timestamp: payload.timestamp || Date.now(),
          is_from_self: payload.is_from_self || false,
          can_rating: payload.can_rating || false,
          reply_method: payload.reply_method || 0,
          knowledge: payload.knowledge || [],
          quote_infos: payload.quote_infos || [],
        }
      })
      break

    case 'thought':
      // 思考事件（DeepSeek-R1 专用）
      onMessage({
        type: 'thought',
        data: {
          procedures: payload.procedures || [],
          elapsed: payload.elapsed || 0,
          record_id: payload.record_id || '',
          session_id: payload.session_id || '',
        }
      })
      break

    case 'reference':
      // 参考来源事件
      onMessage({
        type: 'reference',
        data: {
          record_id: payload.record_id || '',
          references: payload.references || [],
        }
      })
      break

    case 'recommended':
      // 推荐问题事件
      console.log('🔔 chatApi 接收到 recommended 事件:', { eventType, payload })
      onMessage({
        type: 'recommended',
        data: {
          record_id: payload.record_id || '',
          recommendeds: payload.recommendeds || [],
          trace_id: payload.trace_id || '',
        }
      })
      break

    case 'token_stat':
      // Token 统计事件
      onMessage({
        type: 'token_stat',
        data: {
          session_id: payload.session_id || '',
          record_id: payload.record_id || '',
          token_count: payload.token_count || 0,
          elapsed: payload.elapsed || 0,
          procedures: payload.procedures || [],
        }
      })
      break

    case 'error':
      // 错误事件
      onMessage({
        type: 'error',
        data: {
          code: data.error?.code || 0,
          message: data.error?.message || '未知错误',
        }
      })
      break

    default:
      console.warn('Unknown event type:', eventType, data)
  }
}

/**
 * 生成请求 ID
 * @returns {string}
 */
function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

/**
 * 生成会话 ID（UUID 格式）
 * @returns {string}
 */
export function generateSessionId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 生成访客 ID
 * @returns {string}
 */
export function generateVisitorId() {
  return `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

/**
 * 错误码映射
 */
export const ERROR_CODES = {
  400: '请求参数错误，请参阅接入文档',
  460001: 'Token 校验失败',
  460002: '事件处理器不存在',
  460004: '应用不存在',
  460006: '消息不存在或没有操作权限',
  460007: '会话创建失败',
  460008: 'Prompt 渲染失败',
  460009: '访客用户不存在',
  460010: '会话不存在或没有操作权限',
  460011: '超出并发数限制',
  460020: '模型请求超时',
  460021: '知识库未发布',
  460022: '访客创建失败',
  460023: '消息点赞点踩失败',
  460024: '标签不合法',
  460025: '图像识别失败',
  460031: '当前应用连接数超出请求限制，请稍后再试',
  460032: '当前应用模型余额不足',
  460033: '应用不存在或没有操作权限',
  460034: '输入内容过长',
  460035: '计算内容过长，已经停止',
  460036: '任务流程节点预览参数异常',
  460037: '搜索资源已用尽，调用失败',
  460038: '该 AppID 请求存在异常行为，调用失败',
}

/**
 * 获取错误信息
 * @param {number} code - 错误码
 * @returns {string}
 */
export function getErrorMessage(code) {
  return ERROR_CODES[code] || `未知错误 (${code})`
}

/**
 * 获取上传凭证
 * @param {string} bot_app_key - 应用密钥
 * @param {string} bot_biz_id - 机器人业务ID（可选，优先使用）
 * @returns {Promise<Object>} 上传凭证信息
 */
export async function getUploadCredential(bot_app_key, bot_biz_id = '') {
  const url = 'https://wss.lke.cloud.tencent.com/v1/qbot/DescribeStorageCredential'
  
  try {
    // 构建请求参数
    const requestBody = {}
    
    // 优先使用 BotBizId（腾讯云 API 标准参数）
    if (bot_biz_id) {
      requestBody.BotBizId = bot_biz_id
      requestBody.FileType = 'jpeg' // 图片类型
      requestBody.IsPublic = true    // 公开访问
      requestBody.TypeKey = 'realtime' // 实时对话
      console.log('🔑 使用 BotBizId 获取上传凭证:', bot_biz_id)
    } else {
      // 降级使用 bot_app_key（应用端代理接口）
      requestBody.bot_app_key = bot_app_key
      requestBody.file_type = 'image'
      console.log('🔑 使用 bot_app_key 获取上传凭证')
    }
    
    console.log('📤 请求参数:', JSON.stringify(requestBody, null, 2))
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API 响应错误:', response.status, errorText)
      throw new Error(`获取上传凭证失败: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    // 处理返回数据格式（兼容两种响应格式）
    let result = data
    
    // 如果返回的是腾讯云 API 标准格式，提取 Response 对象
    if (data.Response) {
      result = data.Response
      console.log('🔑 获取上传凭证成功（腾讯云 API 格式）:', result)
    } else {
      console.log('🔑 获取上传凭证成功（代理接口格式）:', result)
    }
    
    return result
  } catch (error) {
    console.error('❌ 获取上传凭证失败:', error)
    throw error
  }
}

/**
 * 上传图片到 COS
 * @param {Object} credential - 上传凭证
 * @param {File} file - 图片文件
 * @param {Function} onProgress - 上传进度回调
 * @returns {Promise<string>} 图片 URL
 */
export async function uploadImageToCOS(credential, file, onProgress) {
  try {
    // 构造上传 URL
    const uploadUrl = `https://${credential.Bucket}.${credential.Type}.${credential.Region}.myqcloud.com${credential.UploadPath}`
    
    console.log('📤 开始上传图片:', {
      fileName: file.name,
      fileSize: file.size,
      uploadUrl: uploadUrl,
      hasCredentials: !!credential.Credentials,
      hasToken: !!(credential.Credentials && credential.Credentials.Token)
    })

    // 使用 XMLHttpRequest 以支持进度回调
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      // 监听上传进度
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100
            onProgress(percentComplete)
          }
        })
      }
      
      // 监听完成
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('✅ 图片上传成功:', uploadUrl)
          resolve(uploadUrl)
        } else {
          console.error('❌ 图片上传失败:', xhr.status, xhr.responseText)
          reject(new Error(`上传失败: ${xhr.status} - ${xhr.responseText}`))
        }
      })
      
      // 监听错误
      xhr.addEventListener('error', () => {
        console.error('❌ 图片上传网络错误')
        reject(new Error('网络错误'))
      })
      
      // 发送请求
      xhr.open('PUT', uploadUrl)
      
      // 设置请求头
      xhr.setRequestHeader('Content-Type', file.type)
      
      // 添加 COS 临时密钥（如果有 Credentials）
      if (credential.Credentials && credential.Credentials.Token) {
        xhr.setRequestHeader('x-cos-security-token', credential.Credentials.Token)
        console.log('🔐 使用临时密钥上传')
      } 
      // 兼容旧格式（直接在 credential 对象上的 SecurityToken）
      else if (credential.SecurityToken) {
        xhr.setRequestHeader('x-cos-security-token', credential.SecurityToken)
        console.log('🔐 使用临时密钥上传（旧格式）')
      }
      // 如果有 Authorization 头（某些接口返回）
      else if (credential.Authorization) {
        xhr.setRequestHeader('Authorization', credential.Authorization)
        console.log('🔐 使用 Authorization 上传')
      }
      
      xhr.send(file)
    })
  } catch (error) {
    console.error('❌ 上传图片失败:', error)
    throw error
  }
}

/**
 * 批量上传图片并转换为 markdown 格式
 * @param {Array} images - 图片数组 [{file, name, preview}]
 * @param {string} bot_app_key - 应用密钥
 * @param {string} bot_biz_id - 机器人业务ID（可选）
 * @param {Function} onProgress - 进度回调 (current, total, percent)
 * @returns {Promise<Array>} 图片 URL 数组
 */
export async function uploadImages(images, bot_app_key, bot_biz_id = '', onProgress) {
  if (!images || images.length === 0) {
    return []
  }

  try {
    const imageUrls = []
    const total = images.length

    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      
      console.log(`📸 上传图片 ${i + 1}/${total}: ${image.name}`)
      
      // 获取上传凭证（优先使用 BotBizId）
      const credential = await getUploadCredential(bot_app_key, bot_biz_id)
      
      // 上传图片
      const imageUrl = await uploadImageToCOS(
        credential,
        image.file,
        (percent) => {
          if (onProgress) {
            onProgress(i + 1, total, percent)
          }
        }
      )
      
      imageUrls.push(imageUrl)
      
      console.log(`✅ 图片 ${i + 1}/${total} 上传完成: ${imageUrl}`)
    }

    return imageUrls
  } catch (error) {
    console.error('❌ 批量上传图片失败:', error)
    throw error
  }
}

/**
 * 将图片 URL 转换为 markdown 格式
 * @param {Array} imageUrls - 图片 URL 数组
 * @returns {string} markdown 格式的图片引用
 */
export function convertImagesToMarkdown(imageUrls) {
  if (!imageUrls || imageUrls.length === 0) {
    return ''
  }
  
  return imageUrls.map(url => `![](${url})`).join('')
}
