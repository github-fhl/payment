import React from 'react';
import { Button } from 'antd';
import { downloadUrl } from 'utils';
import Immutable from 'immutable';


export default class ExportAfterPay extends React.PureComponent {
  static defaultProps = {
    $payment: Immutable.Map(),
  };
  exportAfterPay = () => {
    const { dispatch } = this.props;
    const action = new Promise(resolve => {
      dispatch({ type: 'detail/exportAfterPay', resolve });
    });
    action.then(e => {
      if (e.status === 'success') downloadUrl(`/api/${e.path}`);
    });
  };

  render() {
    return (
      <Button size="large" onClick={this.exportAfterPay}>
        导出银行数据
      </Button>
    );
  }
}
