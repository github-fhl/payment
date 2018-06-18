import Immutable from 'immutable';
import { config } from 'utils';
import {
  approDetail,
  fetchDetail,
  setInvoice,
  setReceiveOrder,
  exportBeforePay,
  paid,
  paidSuccess,
  finishReturn,
  finishSetAmount,
  finishSetDate,
  exportAfterPay,
  abandonOrder,
  paidExpense,
  paidSuccessExpense,
} from '../services/detail';

const _pay = config.paymentFields;

// vendor字段默认值
const vendorFields = [
  _pay.vendorName,
  _pay.bankNum,
  _pay.bankName,
  _pay.contacter,
  _pay.telphone,
];

export const formatOrder = data => {
  // 提升 companyName
  data.companyName = data.company && data.company.name;
  data.companyCode = data.company && data.company.code;

  // 提升 details
  if (Array.isArray(data.orderdetails)) {
    data.orderdetails = data.orderdetails.map((detail, index) => {
      // 提升 vendorName
      detail.vendorName = detail.vendor && detail.vendor.name;
      detail.vendorCode = detail.vendor && detail.vendor.code;

      // 提升 reimuserName
      detail.reimuserName = detail.reimuser && detail.reimuser.name;

      // 提升 paytypeId  paytypeCategory
      detail.paytypeId = [detail.paytype && detail.paytype.category, detail.paytypeId, detail.paytypedetailId].filter(e => e);
      if (index === 0) {
        data.paytypeId = detail.paytypeId;
        // 如果是company 类型 默认从detail第一条中获取 vendor信息
        if (data[_pay.vendorType] === config.vendorType.company) {
          const getKey = key => (data[key] = data[key] || detail[key]);
          // 提升vendor
          vendorFields.forEach(getKey);
          // 提升外币的银行信息
          Object.keys(config.overseasFields).forEach(getKey);
        }
      }

      return detail;
    });
  }
  return data;
};

const $paymentInitial = Immutable.fromJS({});
export default {
  namespace: 'detail',

  state: {
    $payment: $paymentInitial,
  },

  effects: {
    * fetch({ payload }, { call, put, select }) {
      const id = yield select(s => s.detail.$payment.get('id'));
      const params = { id, ...payload };
      const response = yield call(fetchDetail, params);
      if (response.status === 'success') {
        yield put({
          type: 'save',
          payload: { $payment: Immutable.fromJS(formatOrder(response.order)) },
        });
      }
    },
    * appro({ payload, resolve }, { call, select }) {
      const { detail } = yield select(s => s);
      const id = detail.$payment.get('id'); // 默认id
      const params = { idArr: [id], ...payload };
      const response = yield call(approDetail, params);
      if (resolve) resolve(response);
    },
    * setInvoice({ payload }, { call, put, select }) {
      const { detail } = yield select(s => s);
      const id = detail.$payment.get('id');
      const params = { idArr: [id], ...payload };
      const response = yield call(setInvoice, params);
      if (response.status === 'success') yield put({ type: 'fetch' });
    },
    * setReceiveOrder({ payload }, { call, put, select }) {
      const { detail } = yield select(s => s);
      const id = detail.$payment.get('id');
      const params = { idArr: [id], ...payload };
      const response = yield call(setReceiveOrder, params);
      if (response.status === 'success') yield put({ type: 'fetch' });
    },
    * exportBeforePay({ payload, resolve }, { call, select }) {
      const { detail } = yield select(s => s);
      const id = detail.$payment.get('id');
      const params = { idArr: [id], ...payload };
      const response = yield call(exportBeforePay, params);
      if (resolve) resolve(response);
    },
    * paid({ payload, resolve, orderType = config.orderType.Payment }, { call, select }) {
      const { detail } = yield select(s => s);
      const id = detail.$payment.get('id');
      const params = { idArr: [id], ...payload };
      const response = yield call(orderType === config.orderType.Expense ? paidExpense : paid, params);
      if (resolve) resolve(response);
    },
    * paidSuccess({ payload, resolve, orderType = config.orderType.Payment }, { call, select }) {
      const { detail } = yield select(s => s);
      const id = detail.$payment.get('id');
      const params = { idArr: [id], ...payload };
      const response = yield call(orderType === config.orderType.Expense ? paidSuccessExpense : paidSuccess, params);
      if (resolve) resolve(response);
    },
    * finishReturn({ payload, resolve }, { call, select, put }) {
      const { detail } = yield select(s => s);
      const id = detail.$payment.get('id');
      const params = { idArr: [id], ...payload };
      const response = yield call(finishReturn, params);
      if (response.status === 'success') yield put({ type: 'fetch' });
      if (resolve) resolve(response);
    },
    * finishSetAmount({ payload, resolve }, { call, select }) {
      const { detail } = yield select(s => s);
      const id = detail.$payment.get('id');
      const params = { id, ...payload };
      const response = yield call(finishSetAmount, params);
      if (resolve) resolve(response);
    },
    * finishSetDate({ payload }, { call, select, put }) {
      const { detail } = yield select(s => s);
      const id = detail.$payment.get('id');
      const params = { id, ...payload };
      const response = yield call(finishSetDate, params);
      if (response.status === 'success') yield put({ type: 'fetch' });
    },
    * exportAfterPay({ payload, resolve }, { call, select }) {
      const { detail } = yield select(s => s);
      const id = detail.$payment.get('id');
      const params = { orderIdArr: JSON.stringify([id]), ...payload };
      const response = yield call(exportAfterPay, params);
      if (resolve) resolve(response);
    },
    * abandonOrder({ payload, resolve }, { call, select }) {
      const { detail } = yield select(s => s);
      const id = detail.$payment.get('id');
      const params = { id, ...payload };
      const response = yield call(abandonOrder, params);
      if (resolve) resolve(response);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    clear(state) {
      return {
        ...state,
        $payment: $paymentInitial,
      };
    },
  },
};
