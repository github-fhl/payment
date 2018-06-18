import React, { Fragment } from 'react';
import { Modal, InputNumber, message } from 'antd';
import Immutable from 'immutable';
import NP from 'number-precision';
import { format, config } from 'utils';
import { TableListImmutable } from 'components/TableList';


export default class Paid extends React.PureComponent {
  state = {
    visible: false,
    $list: Immutable.List(),
  };

  onStart = () => {
    const { $list } = this.props;
    if ($list.size < 1) return message.error('没有需要付款成功的选项');
    this.setState({ $list, visible: true });
  };
  onOk = () => {
    const action = this.props.onOk(this.state.$list);
    if (action && action.then) {
      action.then(e => {
        if (e.status === 'success') this.setState({ visible: false });
      });
    }
  };
  onChangeCNY = index => value => {
    this.setState(prev => ({ $list: prev.$list.setIn([index, 'amountCNY'], value) }));
  };
  onChangeBankCharge = index => value => {
    this.setState(prev => ({ $list: prev.$list.setIn([index, 'bankCharge'], value) }));
  };
  amountRender = (value, $record, index) => {
    if ($record.get('orderType') === config.orderType.OverseasPayment) {
      return <InputNumber style={{ width: 150 }} value={value} onChange={this.onChangeCNY(index)} />;
    } else {
      return null;
    }
  };
  bankChargeRender = (value, $record, index) =>
    <InputNumber style={{ width: 150 }} value={value} onChange={this.onChangeBankCharge(index)} />;

  render() {
    const { $list } = this.state;
    const columns = [
      { dataIndex: 'id', title: 'ID', width: 120 },
      { dataIndex: 'currency', title: '币种', width: 70 },
      {
        dataIndex: config.paymentFields.detail,
        className: 'tar',
        title: '总金额',
        render: $text => {
          let totalAmount = 0;
          if ($text) {
            $text.forEach($item => {
              const money = $item.get(config.paymentFields.money);
              totalAmount = NP.plus(totalAmount || 0, money);
            });
          }
          return format.money(totalAmount);
        },
      },
      {
        dataIndex: 'amountCNY',
        title: '等值人民币',
        render: this.amountRender,
      },
      {
        dataIndex: 'bankCharge',
        title: '银行手续费',
        render: this.bankChargeRender,
      },
    ];
    return (
      <Fragment>
        <span onClick={this.onStart}>
          {this.props.children}
        </span>
        <Modal
          maskClosable={false}
          visible={this.state.visible}
          onCancel={() => this.setState({ visible: false })}
          onOk={this.onOk}
          width={800}
          title="等值人民币"
        >
          <TableListImmutable columns={columns} dataSource={$list} pagination={false} />
        </Modal>
      </Fragment>
    );
  }
}
