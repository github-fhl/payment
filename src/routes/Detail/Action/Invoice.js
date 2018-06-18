import React from 'react';
import Immutable from 'immutable';
import { Button, Dropdown, Menu, Icon } from 'antd';
import { config } from 'utils';


const invoiceText = {
  n: '未收到',
  y: '已收到',
  noNeed: '不需要',
};
export default class Invoice extends React.PureComponent {
  static defaultProps = {
    $payment: Immutable.Map(),
  };
  setInvoice = e => this.props.dispatch({
    type: 'detail/setInvoice',
    payload: { action: e.key },
  });

  render() {
    const { $payment } = this.props;
    const invoiceState = $payment.get(config.paymentFields.invoice);
    return (
      <Dropdown
        overlay={
          <Menu onClick={this.setInvoice}>
            <Menu.Item key="n">{invoiceText.n}</Menu.Item>
            <Menu.Item key="y">{invoiceText.y}</Menu.Item>
            <Menu.Item key="noNeed">{invoiceText.noNeed}</Menu.Item>
          </Menu>
        }
      >
        <Button size="large">
          发票：{invoiceText[invoiceState]}
          <Icon type="down" />
        </Button>
      </Dropdown>
    );
  }
}
