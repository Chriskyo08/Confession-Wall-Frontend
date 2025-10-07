// 统一图片路径，防止重复拼接 /uploads/
export function normalizeImageUrl(url) {
  if (!url) return '';
  // 已经是绝对路径
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // 兼容没有 / 开头的路径
  if (url.startsWith('uploads/')) url = '/' + url;
  // 统一去掉所有 /user/uploads/、/confession/uploads/、/confession/uploads/confessions/ 等多余前缀
  url = url.replace(/^\/(user|confession)\/uploads\//, '/uploads/');
  url = url.replace(/^\/confession\/uploads\//, '/uploads/');
  url = url.replace(/^\/uploads\/confessions\//, '/uploads/confessions/');
  url = url.replace(/^\/uploads\/avatars\//, '/uploads/avatars/');
  // 防止重复 /uploads/
  url = url.replace(/(\/uploads\/)+/g, '/uploads/');
  // 确保以 /uploads/ 开头
  if (!url.startsWith('/uploads/')) {
    url = '/uploads/' + url.replace(/^\/+/, '');
  }
  return url;
}
