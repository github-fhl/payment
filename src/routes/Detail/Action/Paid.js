import React from 'react';
import Immutable from 'immutable';
import { Button } from 'antd';
import PaidModal from 'components/OrderAction/PaidModal';

export default class Paid extends React.PureComponent {
  static defaultProps = {
    $payment: Immutable.Map(),
  };
  onPaid = (values) => {
    const { dispatch, $payment } = this.props;
    // 出纳付款
    return new Promise(resolve => {
      dispatch({ type: 'detail/paid', payload: values, resolve, orderType: $payment.get('orderType') });
    })
      .then(e => {
        if (e.status === 'success') dispatch({ type: 'detail/fetch' });
        return e;
      });
  };

  render() {
    const { $payment } = this.props;
    return (
      <PaidModal
        payments={[$payment]}
        onPaid={this.onPaid}
      >
        <Button size="large" type="primary">
          付款
        </Button>
      </PaidModal>
    );
  }
}
