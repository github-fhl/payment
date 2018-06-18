import React from 'react';
import Immutable from 'immutable';
import { Button, message } from 'antd';
import { formatPaymentFormValues } from '../../../routes/MyList/New';
import { updateOrder } from '../../../services/new';


export default class Abandon extends React.PureComponent {
  static defaultProps = {
    $payment: Immutable.Map(),
  };

  onSave = () => {
    const params = this.getFormatFormValues();
    if (params) {
      updateOrder(params)
        .then((e) => {
          if (e.status === 'success') {
            message.success('保存成功');
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
      <Button size="large" onClick={this.onSave}>
        保存
      </Button>
    );
  }
}
