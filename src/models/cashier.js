import Immutable from 'immutable';
import { fetchOrder } from '../services/api';

const fetchParams = {
  start: { status: 1, role: 'cashier', cashierType: 'approve', applyStatus: 'toHandle' },
  end: { status: 1, role: 'cashier', cashierType: 'approve', applyStatus: 'handled' },
};


export default {
  namespace: 'cashier',

  state: {
    $startList: Immutable.List(),
    $endList: Immutable.List(),
  },

  effects: {
    * fetchStart({ payload }, { call, put }) {
      const response = yield call(fetchOrder, { ...fetchParams.start, ...payload });
      if (response.status === 'success') {
        yield put({
          type: 'save',
          payload: { $startList: Immutable.fromJS(response.orders) },
        });
      }
    },
    * fetchEnd({ payload }, { call, put }) {
      const response = yield call(fetchOrder, { ...fetchParams.end, ...payload });
      if (response.status === 'success') {
        yield put({
          type: 'save',
          payload: { $endList: Immutable.fromJS(response.orders) },
        });
      }
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
