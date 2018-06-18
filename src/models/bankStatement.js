import Immutable from 'immutable';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import NP from 'number-precision';
import { format, config } from 'utils';
import {
  changeIndex,
  fetchBankStatement,
  createBankStatement,
  deleteBankStatement,
  updateBankStatement,
  fetchBankStatementDetail,
} from '../services/bankStatement';

const $initNew = Immutable.Map({ transactionType: config.transactionType.Payment });
export default {
  namespace: 'bankStatement',

  state: {
    // 列表页
    $list: Immutable.List(),
    listCount: 0, // 列表数据条数
    listCurrentPage: 1, // 列表当前页码

    $new: $initNew,
    $detail: Immutable.Map(),

    // 搜索相关数据
    searchParams: {},
    isForeignBank: false,
  },

  effects: {
    * fetchStart({ payload }, { call, put, select }) {
      const { bankStatement: { searchParams }, global: { pagination } } = yield select(s => s);

      // 整理并且去掉无效参数
      const params = { offset: 0, limit: pagination.pageSize, ...searchParams, ...payload };
      for (let key in params) {
        if (params[key] === undefined || params[key] === null || params[key] === '') {
          delete params[key];
        } else if (key === 'date') {
          if (Array.isArray(params[key])) params[key] = JSON.stringify(params[key].map(v => v && format.date(v)));
        }
      }
      const response = yield call(fetchBankStatement, params);
      if (response.status === 'success') {
        const listCurrentPage = Math.floor((NP.divide(params.offset || 0, params.limit || 1)) + 1);
        yield put({
          type: 'save',
          payload: {
            $list: Immutable.fromJS(response.obj.rows),
            listCount: response.obj.count,
            listCurrentPage,
          },
        });
      }
    },
    * changeSearch({ payload }, { select, put }) {
      const { bankStatement: { searchParams }, setting: { account } } = yield select(s => s);
      yield put({ type: 'save', payload: { searchParams: payload } });

      // 修改银行信息
      if (searchParams.subjectId !== payload.subjectId) {
        // 检查银行是否外币
        const $selectItem = account.find($item => $item.get('id') === payload.subjectId);
        if ($selectItem && $selectItem.get(config.paymentFields.currency) === config.currency.USD) {
          yield put({ type: 'save', payload: { isForeignBank: true } });
        }
        // 重新fetch 列表
        yield put({ type: 'fetchStart' });
      }
    },

    * delete({ payload }, { call, put }) {
      const response = yield call(deleteBankStatement, payload);
      if (response.status === 'success') yield put({ type: 'fetchStart' });
    },

    * create({ payload }, { call, put, select }) {
      const { bankStatement: { $new } } = yield select(s => s);
      const values = $new.update('date', format.date).toJS();
      const response = yield call(createBankStatement, { ...values, ...payload });
      if (response.status === 'success') yield put(routerRedux.push('/bank-statement/start'));
    },


    * fetchDetail({ payload }, { call, put, select }) {
      const { bankStatement: { $detail } } = yield select(s => s);
      const id = $detail.get('id');
      const response = yield call(fetchBankStatementDetail, { id, ...payload });
      if (response.status === 'success') {
        let $newDetail = Immutable.fromJS(response.obj);

        // 格式化时间
        $newDetail = $newDetail.update('date', t => t && moment(t));
        yield put({ type: 'save', payload: { $detail: $newDetail } });
      }
    },
    * update({ payload, resolve }, { call, select }) {
      const { bankStatement: { $detail } } = yield select(s => s);
      const values = $detail.update('date', format.date).toJS();
      const response = yield call(updateBankStatement, { ...values, ...payload });
      if (resolve) resolve(response);
    },
    * changeIndex({ payload, resolve }, { call }) {
      const response = yield call(changeIndex, payload);
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
