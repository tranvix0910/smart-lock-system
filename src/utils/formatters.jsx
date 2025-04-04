/**
 * Định dạng ID thành dạng ngắn
 * @param {string} id - ID cần định dạng
 * @returns {string} - ID đã được định dạng
 */
export const formatId = (id) => {
    if (!id) return '';
    return id.substring(0, 8) + '...';
};

/**
 * Định dạng ngày giờ theo chuẩn Việt Nam
 * @param {string} dateString - Chuỗi ngày giờ cần định dạng
 * @returns {string} - Ngày giờ đã được định dạng
 */
export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Định dạng key thành dạng dễ đọc
 * @param {string} key - Key cần định dạng
 * @returns {string} - Key đã được định dạng
 */
export const formatKey = (key) => {
    if (!key) return '';
    return key
        .split(/(?=[A-Z])/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}; 