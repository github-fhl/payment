import Immutable from 'immutable';
import * as fetchSetting from '../services/setting';

export default {
  namespace: 'setting',
  state: {
    type: Immutable.List(),
    company: Immutable.List(),
    vendor: Immutable.List(),
    account: Immutable.List(),
    default: Immutable.List(),
    currency: Immutable.fromJS([{ id: 'CNY', name: 'CNY' }, { id: 'USD', name: 'USD' }]),
  },
  effects: {
    * fetchAll(_, { put, call }) {
      const response = yield call(fetchSetting.all);
      if (response.status === 'success') {
        const { companys, vendors, subjects, paytypes, reimuser } = response.obj;
        const payload = {
          type: Immutable.fromJS(paytypes),
          company: Immutable.fromJS(companys),
          vendor: Immutable.fromJS(vendors),
          account: Immutable.fromJS(subjects),
          default: Immutable.fromJS(reimuser),
        };
        yield put({ type: 'saveAll', payload });
      }
    },
    * fetchType(_, { call, put }) {
      const response = yield call(fetchSetting.type);
      if (response.status === 'success') {
        yield put({ type: 'save', payload: { type: Immutable.fromJS(response.paytypes) } });
      }
    },
    * fetchCompany(_, { call, put }) {
      const response = yield call(fetchSetting.company);
      if (response.status === 'success') {
        yield put({ type: 'save', payload: { company: Immutable.fromJS(response.companys) } });
      }
    },
    * fetchVendor(_, { call, put }) {
      const response = yield call(fetchSetting.vendor);
      if (response.status === 'success') {
        yield put({ type: 'save', payload: { vendor: Immutable.fromJS(response.vendors) } });
      }
    },
    * fetchAccount(_, { call, put }) {
      const response = yield call(fetchSetting.account);
      if (response.status === 'success') {
        yield put({ type: 'save', payload: { account: Immutable.fromJS(response.subjects) } });
      }
    },
    * fetchDefault(_, { call, put }) {
      const response = yield call(fetchSetting.defaults);
      if (response.status === 'success') {
        yield put({ type: 'save', payload: { default: Immutable.fromJS(response.reimusers) } });
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
    saveAll(state, { payload }) {
      const newState = {};
      for (let key in payload) {
        if (state[key] && state[key].size <= 0) {
          newState[key] = payload[key];
        }
      }
      return {
        ...state,
        ...newState,
      };
    },
  },
};
