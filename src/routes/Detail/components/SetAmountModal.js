import React, { Fragment } from 'react';
import { Modal, Form, InputNumber } from 'antd';
import Immutable from 'immutable';
import NP from 'number-precision';
import { format, config } from 'utils';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

@Form.create()
export default class Paid extends React.PureComponent {
  static defaultProps = {
    $payment: Immutable.Map(),
  };
  state = {
    visible: false,
  };
  onOk = () => {
    const { form: { validateFields } } = this.props;
    validateFields(
      (err, values) => {
        if (!err) {
          // 出纳付款
          const action = this.props.onOk(values);
          if (action && action.then) action.then(() => this.setState({ visible: false }));
        }
      },
    );
  };

  render() {
    const { $payment, form: { getFieldDecorator } } = this.props;
    let totalAmount;
    const $detail = $payment.get(config.paymentFields.detail);
    if ($detail) {
      $detail.forEach($item => {
        const money = $item.get(config.paymentFields.money);
        totalAmount = NP.plus(totalAmount || 0, money);
      });
    }
    return (
      <Fragment>
        <span onClick={() => this.setState({ visible: true })}>
          {this.props.children}
        </span>
        <Modal
          maskClosable={false}
          visible={this.state.visible}
          onCancel={() => this.setState({ visible: false })}
          onOk={this.onOk}
          title="等值人民币"
        >
          <Form layout="horizontal">
            <Form.Item label="总金额" {...formItemLayout}>
              {format.money(totalAmount)}
            </Form.Item>
            <Form.Item label="等值人民币" {...formItemLayout}>
              {getFieldDecorator('amountCNY', {
                rules: [{ type: 'number', required: true, message: '请输入金额' }],
              })(
                <InputNumber style={{ width: 200 }} />,
              )}
            </Form.Item>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}
