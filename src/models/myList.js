import Immutable from 'immutable';
import { routerRedux } from 'dva/router';
import { fetchOrder } from '../services/api';
import { importPaymentOrder } from '../services/new';

const fetchParams = {
  start: { status: 1, role: 'applicant', applyStatus: 'toHandle' },
  process: { status: 1, role: 'applicant', applyStatus: 'handling' },
  end: { status: 1, role: 'applicant', applyStatus: 'handled' },
};


export default {
  namespace: 'myList',

  state: {
    $startList: Immutable.List(),
    $processList: Immutable.List(),
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
    * fetchProcess({ payload }, { call, put }) {
      const response = yield call(fetchOrder, { ...fetchParams.process, ...payload });
      if (response.status === 'success') {
        yield put({
          type: 'save',
          payload: { $processList: Immutable.fromJS(response.orders) },
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
    * fetchDetail({ payload }, { call, put, select }) {
      const response = yield call(fetchOrder, payload);
      if (response.status === 'success') {
        const $detail = Immutable.fromJS(response.obj || {});
        yield put({
          type: 'save',
          payload: { $detail },
        });

        // fetch 课程评论
        const courseId = $detail.getIn(['course', 'id']);
        const limit = yield select(_ => _.global.pagination.pageSize);
        if (courseId) {
          yield put({ type: 'fetchComment', payload: { courseId, limit } });
        } else {
          yield put({
            type: 'save',
            payload: { $comment: Immutable.List(), commentCount: 0 },
          });
        }
      }
    },
    * importPayment({ payload, resolve }, { call, put }) {
      const response = yield call(importPaymentOrder, payload);
      if (response.status === 'success') yield put(routerRedux.push(`/my-list/start/${response.obj.id}`));
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
