import Immutable from 'immutable';
import { routerRedux } from 'dva/router';
import { format } from 'utils';
import { createReceipt, updateReceipt } from '../services/receipt';
import { fetchPermission } from '../services/permission';

export default {
  namespace: 'permission',

  state: {
    $list: Immutable.List(),
  },

  effects: {
    * fetch({ payload }, { call, put }) {
      const response = yield call(fetchPermission, payload);
      if (response.status === 'success') {
        yield put({
          type: 'save',
          payload: { $list: Immutable.fromJS(response.accounts) },
        });
      }
    },
    * create({ payload }, { call, put, select }) {
      const { receipt: { $new } } = yield select(s => s);
      const values = $new.update('collectDate', format.date).update('filePath', $item => {
        if ($item) return $item.getIn([0, 'response', 'obj']);
        return $item;
      }).toJS();
      const response = yield call(createReceipt, { ...values, ...payload });
      if (response.status === 'success') yield put(routerRedux.push('/receipt/start'));
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
