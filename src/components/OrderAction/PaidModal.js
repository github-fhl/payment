import React, { Fragment } from 'react';
import { message, Modal, Select, DatePicker, InputNumber } from 'antd';
import Immutable from 'immutable';
import { connect } from 'dva';
import { TableListImmutable } from 'components/TableList';
import Ellipsis from 'components/Ellipsis';
import { format, msg } from 'utils';
import { paymentFields as _pay } from '../../common/config';
import { fetchPayNum } from '../../services/detail';


const Option = Select.Option;


@connect(({ setting }) => ({
  account: setting.account,
}))
export default class CashierPayFooter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      minPayNum: 1, // 凭证号的最小流水号
      visible: false,
      subjectId: null,
      subjectDate: null,
      payments: [],
    };
    this.columns = [
      { dataIndex: _pay.id, width: 120, title: 'ID' },
      {
        dataIndex: _pay.paytypeId,
        title: '类型',
        render: (text, record) => {
          const category = record.get('paytypeCategory') || record.getIn(['orderdetails', 0, 'paytype', 'category']);
          let otherList = record.get(_pay.paytypeId) || [record.getIn(['orderdetails', 0, 'paytypeId']), record.getIn(['orderdetails', 0, 'paytypedetailId'])];
          return Immutable.List().push(category && msg.paytypeId[category]).concat(otherList).filter(e => e)
            .join('/');
        },
      },
      { dataIndex: _pay.description,
        title: '描述',
        render: text => <Ellipsis length={300}>{text}</Ellipsis> },
      { dataIndex: _pay.amount, width: 100, render: m => format.money(m), className: 'money', title: '总金额' },
      {
        dataIndex: _pay.payNum,
        title: '凭证号',
        width: 180,
        render: (text, record, index) => {
          const payNum = record.get('payNum');
          if (this.state.payments.length > 1 && payNum) {
            // 按payment的数量更改凭证号
            let orderList = [payNum.slice(0, -3), payNum.substr(-3)];

            return (
              <InputNumber
                min={this.state.minPayNum}
                max={(this.state.minPayNum + this.state.payments.length) - 1}
                style={{ width: 170 }}
                value={parseInt(orderList[1])}
                formatter={value => `${orderList[0]}${(`000${value}`).substr(-3)}`}
                parser={value => parseInt(value.toString().substr(-3))}
                onChange={(value) => this.setState(prevState => ({
                  payments: prevState.payments.map(($payments, i) => {
                    if (i === index) {
                      return $payments.set(
                        'payNum', `${orderList[0]}${(`000${value}`).substr(-3)}`,
                      );
                    }
                    return $payments;
                  }),
                }))}
              />);
          }
          return payNum;
        },
      },
    ];
  }

  onOk = () => {
    const { onPaid } = this.props;
    const { subjectId, subjectDate, payments } = this.state;

    // 检查表单是否为空
    if (!this.state.subjectId) return message.error('缺少付款银行');
    if (!this.state.subjectDate) return message.error('缺少付款日期');

    // 格式化参数
    let values = {
      subjectId,
      paidDate: subjectDate.format('YYYY-MM-DD'),
      idArr: payments.map($payment => $payment.get('id')),
      paidNo: payments.reduce((value, $payment) => {
        value[$payment.get('id')] = $payment.get(_pay.payNum);
        return value;
      }, {}),
    };

    // 出纳付款
    const action = onPaid(values);
    if (action.then) action.then(() => this.setState({ visible: false }));
  };
  onSubjectDateChange = (data) => this.setState({ subjectDate: data }, this.updatePayNum);
  onSubjectIdChange = v => this.setState({ subjectId: v }, this.updatePayNum);
  initialModal = () => {
    const { payments } = this.props;
    if (payments.length > 0) {
      this.setState({ payments, visible: true });
    } else {
      message.error('您没有勾选申请单或勾选的申请单已付款');
    }
  };
  updatePayNum = () => {
    const { subjectId, subjectDate } = this.state;
    if (subjectId && subjectDate) {
      fetchPayNum({ subjectId, subjectDate: subjectDate.format('YYMM') }).then(e => {
        if (e.error) return;

        // 按payment的数量自动设置凭证号
        let orderList = [e.order.slice(0, -3), e.order.substr(-3)];
        this.setState(prevState => ({
          minPayNum: parseInt(orderList[1]) + 1,
          payments: prevState.payments.map(
            ($payments, i) => $payments.set(
              'payNum', `${$payments.get('companyCode') || $payments.getIn(['company', 'code'])}${orderList[0]}${(`000${parseInt(orderList[1]) + 1 + i}`).substr(-3)}`,
            ),
          ),
        }));
      });
    }
  };

  render() {
    const { account } = this.props;
    const { payments, visible, subjectId, subjectDate } = this.state;

    return (
      <Fragment>
        <span onClick={this.initialModal}>
          {this.props.children}
        </span>
        <Modal
          title="付款详情"
          visible={visible}
          onCancel={() => this.setState({ visible: false })}
          maskClosable={false}
          onOk={this.onOk}
          width={1000}
        >
          <div>
            <p style={{ display: 'inline-block', marginRight: 20 }}>付款银行</p>
            <Select
              showSearch
              style={{ width: 300, display: 'inline-block', marginRight: 20, marginLeft: 5 }}
              value={subjectId}
              onChange={this.onSubjectIdChange}
              optionFilterProp="children"
              dropdownMatchSelectWidth={false}
              filterOption={(input, option) => option.props.value.indexOf(input) >= 0}
            >
              {account &&
              account.filter($a => $a.get('bankFlag') === 'y').map($a => (
                <Option
                  key={$a.get('id')}
                >{`${$a.get('name')}, ${$a.get('bankNum') ? $a.get('bankNum') : ''}`}
                </Option>
              ))
              }
            </Select>
            <p style={{ display: 'inline-block', marginRight: 20 }}>付款日期</p>
            <DatePicker
              value={subjectDate}
              style={{ display: 'inline-block' }}
              onChange={this.onSubjectDateChange}
            />
          </div>
          <TableListImmutable
            pagination={false}
            style={{ marginTop: 20 }}
            columns={this.columns}
            dataSource={payments}
          />
        </Modal>
      </Fragment>
    );
  }
}
