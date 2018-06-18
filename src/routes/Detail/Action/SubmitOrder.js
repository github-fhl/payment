import React from 'react';
import Immutable from 'immutable';
import { routerRedux } from 'dva/router';
import { Button } from 'antd';
import { formatPaymentFormValues } from '../../../routes/MyList/New';
import { updateOrder } from '../../../services/new';

export default class Abandon extends React.PureComponent {
  static defaultProps = {
    $payment: Immutable.Map(),
  };

  onSave = () => {
    const params = this.getFormatFormValues();
    if (params) {
      let updateAction = updateOrder;
      let values = { isSubmit: true, ...params };
      updateAction(values)
        .then((e) => {
          if (e.status === 'success') {
            this.props.dispatch(routerRedux.push('/my-list/process'));
          }
        });
    }
  };
  getFormatFormValues = () => {
    let params;
    const form = this.props.getForm();
    form.validateFields((err, values) => {
      if (!err) {
        params = formatPaymentFormValues(this.props.setting)(values);
      }
    });
    return params;
  };

  render() {
    return (
      <Button size="large" type="primary" onClick={this.onSave}>
        提交审批
      </Button>
    );
  }
}

