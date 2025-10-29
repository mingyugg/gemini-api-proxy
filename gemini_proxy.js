// 目标 API 的主机地址
const TARGET_HOST = 'generativelanguage.googleapis.com';

export default {
  /**
   * Worker 的主入口点
   * @param {Request} request - 客户端发来的请求
   * @returns {Response} - 返回给客户端的响应
   */
  async fetch(request) {
    
    // 1. 处理 CORS 预检请求 (OPTIONS)
    // 浏览器在发送 POST/PUT/DELETE 或带有自定义头（如 Authorization）的请求前
    // 会先发送一个 OPTIONS 请求来“询问”服务器是否允许。
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    // 2. 构建目标 URL
    // 复制客户端请求的 URL
    const url = new URL(request.url);
    // 只替换主机名
    url.host = TARGET_HOST;

    // 3. 创建并转发请求
    // 我们直接使用原始的 request 对象来初始化新的 Request。
    // 这将自动复制 method, body, 以及所有的 headers (包括客户端发来的 Authorization)。
    const newRequest = new Request(url.toString(), request);

    // 4. 发送请求到 Gemini API
    const response = await fetch(newRequest);

    // 5. 处理来自 Gemini 的响应
    // 创建一个新的响应副本，以便我们可以修改它的 Headers
    const newResponse = new Response(response.body, response);

    // 6. 添加 CORS 头部，允许您的前端应用跨域访问
    setCorsHeaders(newResponse);

    // 7. 将最终的响应返回给客户端
    return newResponse;
  },
};

/**
 * 处理 CORS 预检请求 (OPTIONS)
 * @param {Request} request
 * @returns {Response}
 */
function handleOptions(request) {
  const headers = new Headers();
  
  // 允许的来源。为了安全，最好替换为您的前端域名
  headers.set('Access-Control-Allow-Origin', '*'); 
  
  // 允许的 HTTP 方法
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  // 关键：允许客户端在实际请求中携带的头部
  // 我们这里直接反射客户端“询问”的头部 (Access-Control-Request-Headers)
  // 这将自动允许 'Content-Type' 和 'Authorization'
  const requestHeaders = request.headers.get('Access-Control-Request-Headers');
  if (requestHeaders) {
    headers.set('Access-Control-Allow-Headers', requestHeaders);
  }

  // 预检请求的缓存时间（秒）
  headers.set('Access-Control-Max-Age', '86400');

  return new Response(null, { headers: headers });
}

/**
 * 为实际的 API 响应添加 CORS 头部
 * @param {Response} response
 */
function setCorsHeaders(response) {
  // 允许所有来源（*）或指定来源
  // 确保这里与 handleOptions 匹配
  response.headers.set('Access-Control-Allow-Origin', '*');
}