import React from 'react';
import { Button, Dropdown, Menu, Icon } from 'antd';
import { config } from 'utils';
import Immutable from 'immutable';


const receiveOrderText = {
  n: '未收到',
  y: '已收到',
};
export default class Invoice extends React.PureComponent {
  static defaultProps = {
    $payment: Immutable.Map(),
  };
  setReceiveOrder = e => this.props.dispatch({
    type: 'detail/setReceiveOrder',
    payload: { action: e.key },
  });

  render() {
    const { $payment } = this.props;
    const receiveOrderState = $payment.get(config.paymentFields.receiveOrderStatus);
    return (
      <Dropdown
        overlay={
          <Menu onClick={this.setReceiveOrder}>
            <Menu.Item key="n">{receiveOrderText.n}</Menu.Item>
            <Menu.Item key="y">{receiveOrderText.y}</Menu.Item>
          </Menu>
        }
      >
        <Button size="large">
          实体订单：{receiveOrderText[receiveOrderState]}
          <Icon type="down" />
        </Button>
      </Dropdown>
    );
  }
}
