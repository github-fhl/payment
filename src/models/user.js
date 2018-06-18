import { config } from 'utils';
import { stringify } from 'qs';
import { routerRedux } from 'dva/router';
import { reloadAuthorized } from 'utils/Authorized';
import { queryCurrent, getLog } from '../services/user';

const logUrl = {
  order: ['/my-list/start', '/my-list'],
  managerAppro: ['/supervisor/start', ['/supervisor']],
  cashierAppro: ['/cashier/start', '/cashier'],
  icAppro: ['/inter-company/start', '/inter-company'],
  financeAppro: ['/finance/start', '/finance'],
  chiefAppro: ['/chief/start', '/chief'],
  cashierPay: ['/paying/start', '/paying'],
  approvingOrder: ['/my-list/process', '/my-list'],
  financeSubject: ['/finance/end', '/finance'],
  receiptNum: ['/receipt/start'],
};

// 导航的路径，对应的log 数量
const getLogNum = (log = {}) => {
  let logNum = {};
  for (let key in logUrl) {
    if (log[key]) {
      logUrl[key].forEach(url => {
        if (logNum[url]) {
          logNum[url] += parseInt(log[key]);
        } else {
          logNum[url] = parseInt(log[key]);
        }
      });
    }
  }
  return logNum;
};

const initialValue = {
  role: [config.roles.guest],
  userinfo: {},
  logNum: {},
};

export default {
  namespace: 'user',
  state: initialValue,
  subscriptions: {
    setup({ dispatch, history }) {
      dispatch({ type: 'fetchCurrent' });
      history.listen(() => dispatch({ type: 'getLog' }));
    },
  },
  effects: {
    * fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      if (response.status === 'success') yield put({ type: 'saveUser', payload: response });
      if (response.status === 'failed') yield put({ type: 'relogin' });
    },
    * relogin(_, { put, select }) {
      const pathname = yield select(state => state.routing.location.pathname);
      const redirect = stringify({ redirect: pathname });
      yield put({ type: 'clearUser' });
      yield put(routerRedux.push(`/user/login?${redirect}`));
    },
    * getLog({ payload }, { call, put, select }) {
      const id = yield select(state => state.user.userinfo.id);
      const params = { id, ...payload };
      if (params.id) {
        const response = yield call(getLog, params);
        if (response.status === 'success') {
          yield put({ type: 'save', payload: { logNum: getLogNum(response.applylogs) } });
        }
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
    clearUser() {
      reloadAuthorized(initialValue.role);
      return initialValue;
    },
    saveUser(state, action) {
      const { status, roles, scopes, logNum, ...userinfo } = action.payload;
      let role = roles.map(item => item.accountrole.roleId);
      reloadAuthorized(role.join('.'));
      return {
        ...state, role, scopes, logNum: getLogNum(logNum), userinfo,
      };
    },
  },
};
