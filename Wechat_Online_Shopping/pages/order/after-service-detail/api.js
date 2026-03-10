import dayjs from 'dayjs';

export { cancelRights, getRightsDetail } from '../../../services/order/afterSale';

export const formatTime = (date, template) => dayjs(date).format(template);
