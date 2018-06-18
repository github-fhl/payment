import Immutable from 'immutable';
import { routerRedux } from 'dva/router';
import { format } from 'utils';
import moment from 'moment';
import { fetchVoucher, createVoucher, updateVoucher, fetchVoucherDetail } from '../services/voucher';


const bankStatements = JSON.parse(localStorage.getItem('bankStatementIds'));
let voucherinfo = JSON.parse(localStorage.getItem('voucherinfo')) || {};
const costType = voucherinfo.costType || '';
const transactionType = voucherinfo.transactionType || '';
const vendorId = voucherinfo.vendorId || '';
const companyId = voucherinfo.companyId || '';

let voucherDetails = voucherinfo.voucherdetails || [];
if (voucherDetails.length) {
  let n = voucherDetails.filter(item => item.bankFlag === 'n');
  n = n.map((item, index) => ({ ...item, row: `${index},details` }));
  let y = voucherDetails.filter(item => item.bankFlag === 'y');
  voucherDetails = n.concat(y);
}
voucherDetails = Immutable.fromJS(voucherDetails);
const $initNew = Immutable.Map({ transactionType, bankStatements, costType, voucherDetails, vendorId, companyId });
export default {
  namespace: 'voucher',

  state: {
    $startList: Immutable.List(),
    $detail: Immutable.Map(),
    $new: $initNew,
  },
  effects: {
    * fetchStart({ payload }, { call, put }) {
      const response = yield call(fetchVoucher, payload);
      if (response.status === 'success') {
        yield put({
          type: 'save',
          payload: { $startList: Immutable.fromJS(response.objs) },
        });
      }
    },
    * create({ payload }, { call, put, select }) {
      const { voucher: { $new } } = yield select(s => s);
      const values = $new.update('voucherDate', format.date).toJS();
      const response = yield call(createVoucher, { ...values, ...payload });
      if (response.status === 'success') yield put(routerRedux.push('/voucher/start'));
    },
    * fetchDetail({ payload }, { call, put, select }) {
      const { voucher: { $detail } } = yield select(s => s);
      const id = $detail.get('id');
      const response = yield call(fetchVoucherDetail, { id, ...payload });
      if (response.status === 'success') {
        let $newDetail = Immutable.fromJS(response.obj);

        // 格式化时间，上传文件数据
        $newDetail = $newDetail.update('voucherDate', t => t && moment(t));
        yield put({ type: 'save', payload: { $detail: $newDetail } });
      }
    },
    * update({ payload, resolve }, { call }) {
      const response = yield call(updateVoucher, payload);
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
  },
};
