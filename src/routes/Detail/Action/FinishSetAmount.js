import React from 'react';
import { Button } from 'antd';
import Immutable from 'immutable';
import { config } from 'utils';
import SetAmountModal from '../components/SetAmountModal';

export default class Paid extends React.PureComponent {
  static defaultProps = {
    $payment: Immutable.Map(),
  };
  onOk = (values) => {
    const { dispatch } = this.props;

    return new Promise(resolve => {
      dispatch({ type: 'detail/finishSetAmount', payload: values, resolve });
    })
      .then(e => {
        if (e.status === 'success') dispatch({ type: 'detail/fetch' });
        return e;
      });
  };

  render() {
    const { $payment } = this.props;
    const isOverseas = $payment.get('orderType') === config.orderType.OverseasPayment;
    if (!isOverseas) return null;
    return (
      <SetAmountModal $payment={$payment} onOk={this.onOk}>
        <Button size="large">
          修改等值人民币
        </Button>
      </SetAmountModal>
    );
  }
}

