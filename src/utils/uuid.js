/**
 * 生成或获取当前设备的唯一标识 (Client UUID)
 * 用于区分不同浏览器/设备的用户，实现轻量级隔离
 */
export const getClientUUID = () => {
    const STORAGE_KEY = 'vive_client_uuid';

    // 1. 尝试从本地存储获取
    let uuid = localStorage.getItem(STORAGE_KEY);

    // 2. 如果不存在，生成一个新的 UUID (v4 style simple implementation)
    if (!uuid) {
        uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        localStorage.setItem(STORAGE_KEY, uuid);
    }

    return uuid;
};

/**
 * 获取当前用户的存储 Key (Namespace)
 * @param {string} baseKey 基础 Key，如 'vive_result'
 * @returns {string} 带有 UUID 的 Key，如 'vive_result_u12345'
 */
export const getUserStorageKey = (baseKey) => {
    const uuid = getClientUUID();
    return `${baseKey}_${uuid}`;
};
