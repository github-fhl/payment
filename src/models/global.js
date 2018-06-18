import { queryNotices } from '../services/api';
import store from '../index';


// 翻页设置
const showTotal = total => `总共 ${total} 条`;

export default {
  namespace: 'global',

  state: {
    collapsed: localStorage.getItem('collapsed') === 'true',
    notices: [],

    // 默认翻页配置
    pagination: {
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['2', '10', '20', '30', '80', '150'],
      pageSize: parseInt(window.localStorage.getItem('pageSize')) || 10,
      onShowSizeChange: (current, size) => store.dispatch({ type: 'global/changePageSize', payload: size }),
      showTotal,
    },

  },

  effects: {
    * fetchNotices(_, { call, put }) {
      const data = yield call(queryNotices);
      yield put({
        type: 'saveNotices',
        payload: data,
      });
      yield put({
        type: 'user/changeNotifyCount',
        payload: data.length,
      });
    },
    * clearNotices({ payload }, { put, select }) {
      yield put({
        type: 'saveClearedNotices',
        payload,
      });
      const count = yield select(state => state.global.notices.length);
      yield put({
        type: 'user/changeNotifyCount',
        payload: count,
      });
    },
  },

  reducers: {
    changeLayoutCollapsed(state, { payload }) {
      localStorage.setItem('collapsed', payload);
      return {
        ...state,
        collapsed: payload,
      };
    },
    saveNotices(state, { payload }) {
      return {
        ...state,
        notices: payload,
      };
    },
    saveClearedNotices(state, { payload }) {
      return {
        ...state,
        notices: state.notices.filter(item => item.type !== payload),
      };
    },

    changePageSize(state, { payload }) {
      window.localStorage.setItem('pageSize', payload);
      return {
        ...state,
        pagination: { ...state.pagination, pageSize: payload },
      };
    },
  },

  subscriptions: {
    setup({ history }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      return history.listen(({ pathname, search }) => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
  },
};
