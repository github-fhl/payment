import React from 'react';
import Immutable from 'immutable';
import { Button } from 'antd';
import BatchSetAmountModal from '../components/BatchSetAmountModal';

export default class Paid extends React.PureComponent {
  static defaultProps = {
    $payment: Immutable.Map(),
    disabled: false,
    size: 'large',
  };
  batchPaySuccess = $list => {
    const { dispatch } = this.props;
    let amountCNY = {};
    let bankCharge = {};
    let idArr = [];
    $list.forEach($item => {
      const id = $item.get('id');
      idArr.push(id);
      if ($item.get('amountCNY')) amountCNY[id] = $item.get('amountCNY');
      bankCharge[id] = $item.get('bankCharge') || 0;
    });
    // 出纳付款
    return new Promise(resolve => dispatch({
      type: 'detail/paidSuccess',
      payload: { idArr, amountCNY, bankCharge },
      resolve,
    }))
      .then(e => {
        if (e.status === 'success') {
          dispatch({ type: 'user/getLog' });
          dispatch({ type: 'detail/fetch' });
        }
        return e;
      });
  };

  render() {
    const { $payment, size, disabled } = this.props;
    return (
      <BatchSetAmountModal $list={Immutable.List([$payment])} onOk={this.batchPaySuccess}>
        <Button size={size} disabled={disabled} type="primary">
          确认付款
        </Button>
      </BatchSetAmountModal>
    );
  }
}
