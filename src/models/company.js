import { fetchCompanyProfile } from '../services/company';

export default {
  namespace: 'company',

  state: {
    profile: {},
  },

  effects: {
    * fetchProfile(_, { call, put }) {
      const response = yield call(fetchCompanyProfile);
      if (response.status === 'success') yield put({ type: 'saveProfile', payload: response.obj });
    },
  },

  reducers: {
    saveProfile(state, { payload }) {
      return {
        ...state,
        profile: payload,
      };
    },
  },
};
