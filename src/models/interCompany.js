import Immutable from 'immutable';
import { config } from 'utils';
import { fetchOrder } from '../services/api';

const fetchParams = {
  start: { status: 1, role: config.roles.InterCompany, applyStatus: 'toHandle' },
  end: { status: 1, role: config.roles.InterCompany, applyStatus: 'handled' },
};


export default {
  namespace: 'interCompany',

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
