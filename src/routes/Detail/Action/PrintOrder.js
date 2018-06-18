import React from 'react';
import { Button } from 'antd';
import Immutable from 'immutable';


export default class PrintOrder extends React.PureComponent {
  static defaultProps = {
    $payment: Immutable.Map(),
  };
  PrintOrder = () => {
    const { $payment } = this.props;
    let w = window.open('about:blank');
    w.location.href = `/api/print/paymentOrder/?orderId=${$payment.get('id')}`;
  };

  render() {
    return (
      <Button size="large" onClick={this.exportAfterPay}>
        打印
      </Button>
    );
  }
}
