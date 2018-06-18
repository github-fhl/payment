import Immutable from 'immutable';
import { config } from 'utils';
import { getPaymentFormStorage, newOrder } from '../services/new';

const $init = Immutable.Map({ [config.paymentFields.currency]: config.currency.CNY });
export default {
  namespace: 'new',

  state: {
    $payment: $init,
  },

  effects: {
    * create({ payload, resolve }, { call }) {
      const response = yield call(newOrder, payload);
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
    init(state) {
      const value = getPaymentFormStorage();
      return {
        ...state,
        $payment: value ? Immutable.fromJS(value) : $init,
      };
    },
    onFieldsChange(state, action) {
      return {
        ...state,
        $payment: state.$payment.merge(action.payload),
      };
    },
  },
};
