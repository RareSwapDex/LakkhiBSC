import { notification } from 'antd';

/**
 * Show a success notification
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
export const showSuccessNotification = (title, message) => {
  notification.success({
    message: title,
    description: message,
    placement: 'topRight',
    duration: 5,
  });
};

/**
 * Show an error notification
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
export const showErrorNotification = (title, message) => {
  notification.error({
    message: title,
    description: message,
    placement: 'topRight',
    duration: 5,
  });
};

/**
 * Show an information notification
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
export const showInfoNotification = (title, message) => {
  notification.info({
    message: title,
    description: message,
    placement: 'topRight',
    duration: 5,
  });
};

/**
 * Show a warning notification
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
export const showWarningNotification = (title, message) => {
  notification.warning({
    message: title,
    description: message,
    placement: 'topRight',
    duration: 5,
  });
};

export default {
  success: showSuccessNotification,
  error: showErrorNotification,
  info: showInfoNotification,
  warning: showWarningNotification,
}; 