export { getRightsList } from '../../../services/order/afterSale';

export const resp = {
  data: {
    pageNum: 1,
    pageSize: 10,
    totalCount: 0,
    states: {
      audit: 0,
      approved: 0,
      complete: 0,
      closed: 0,
    },
    dataList: [],
  },
  code: 'Success',
  msg: null,
  success: true,
};
