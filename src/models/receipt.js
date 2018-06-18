import Immutable from 'immutable';
import { routerRedux } from 'dva/router';
import _ from 'lodash';
import moment from 'moment';
import { format, config } from 'utils';
import { fetchReceipt, createReceipt, updateReceipt, fetchReceiptDetail } from '../services/receipt';

const $initNew = Immutable.Map({ [config.paymentFields.currency]: config.currency.CNY });
export default {
  namespace: 'receipt',

  state: {
    $startList: Immutable.List(),
    $new: $initNew,
    $detail: Immutable.Map(),
  },

  effects: {
    * fetchStart({ payload }, { call, put }) {
      const response = yield call(fetchReceipt, payload);
      if (response.status === 'success') {
        yield put({
          type: 'save',
          payload: { $startList: Immutable.fromJS(response.objs) },
        });
      }
    },
    * create({ payload }, { call, put, select }) {
      const { receipt: { $new } } = yield select(s => s);
      const values = $new.update('collectDate', format.date).update('filePath', filePath => {
        if (Array.isArray(filePath)) return _.get(filePath, [0, 'response', 'obj']);
        return filePath;
      }).toJS();
      const response = yield call(createReceipt, { ...values, ...payload });
      if (response.status === 'success') yield put(routerRedux.push('/receipt/start'));
    },
    * fetchDetail({ payload }, { call, put, select }) {
      const { receipt: { $detail } } = yield select(s => s);
      const id = $detail.get('id');
      const response = yield call(fetchReceiptDetail, { id, ...payload });
      if (response.status === 'success') {
        let $newDetail = Immutable.fromJS(response.obj);

        // 格式化时间，上传文件数据
        $newDetail = $newDetail.update('collectDate', t => t && moment(t)).update('filePath', file => {
          if (typeof file === 'string') {
            return [{ uid: -1, name: 'view', value: file, url: `/api/upload/${file}` }];
          }
          return file;
        });
        yield put({ type: 'save', payload: { $detail: $newDetail } });
      }
    },
    * update({ payload, resolve }, { call }) {
      const response = yield call(updateReceipt, payload);
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
