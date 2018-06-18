import { routerRedux } from 'dva/router';
import { login, logout } from '../services/user';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    * login({ payload }, { call, put }) {
      const response = yield call(login, payload);
      if (response.status === 'success') {
        yield put({ type: 'user/saveUser', payload: response });
        const urlParams = new URL(window.location.href);
        let redirect = urlParams.searchParams.get('redirect');
        if (!redirect || redirect === '/user/login') redirect = '/';
        yield put(routerRedux.push(redirect));
      }
    },
    * logout(_, { call, put }) {
      yield put({ type: 'user/relogin' });
      yield call(logout);
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
  },
};
