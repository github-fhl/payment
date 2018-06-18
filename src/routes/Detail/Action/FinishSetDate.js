import React from 'react';
import { Button } from 'antd';
import Immutable from 'immutable';
import SetDate from 'components/OrderAction/SetDate';

export default class FinishSetDate extends React.PureComponent {
  static defaultProps = {
    $payment: Immutable.Map(),
  };
  onChangeDate = params => this.props.dispatch({ type: 'detail/finishSetDate', payload: { paidDate: params.date } });

  render() {
    const { $payment } = this.props;
    return (
      <SetDate
        date={$payment.get('paidDate')}
        onOk={this.onChangeDate}
      >
        <Button size="large" type="danger">
          修改付款日期
        </Button>
      </SetDate>
    );
  }
}
