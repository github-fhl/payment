import React from 'react';
import { Row, Col, Alert, Badge, Tooltip } from 'antd';
import NP from 'number-precision';
import Immutable from 'immutable';
import { format, msg, config } from 'utils';
import moment from 'moment';
import { AmountFormat } from 'components/NumberInfo';
import { CompanyValueToText } from 'components/Setting';
import { TableListImmutable } from 'components/TableList';
import { paymentFields as _pay, $payments } from '../../common/config';
import style from './style.less';

const paymentFormStatus = [config.approStatus.abandoned];

export default class View extends React.Component {
  componentWillMount() {
    this.columns = {
      content: [
        { dataIndex: _pay.id, title: 'ID' },
        { dataIndex: _pay.companyName, title: '付款公司' },
        { dataIndex: _pay.invoice, title: '发票' },
        { dataIndex: _pay.createdAt, render: date => format.date(date), title: '创建日期' },
        { dataIndex: _pay.description, span: 24, title: '描述' },
      ],
      pay: [
        { dataIndex: _pay.currency, title: '币种' },
        { dataIndex: _pay.amount, render: m => format.money(m), title: '总额' },
        { dataIndex: 'amountCNY', title: '等值人民币', render: m => format.money(m) },
        { dataIndex: 'bankCharge', title: '银行手续费', render: m => format.money(m) },
        { dataIndex: _pay.vendorType, render: (text) => msg.vendorType[text], title: '收款方类别' },
        { dataIndex: _pay.paidDate, render: text => text && moment(text).format('YYYY-MM-DD'), title: '归属月份' },
      ],
      vendor: [
        { dataIndex: _pay.vendorName, take: $payments.vendorName, title: '收款方' },
        { dataIndex: _pay.bankNum, take: $payments.bankNum, title: '银行账号' },
        { dataIndex: _pay.bankName, take: $payments.bankName, title: '银行名称' },
        { dataIndex: _pay.contacter, take: $payments.contacter, title: '联系人' },
        { dataIndex: _pay.telphone, take: $payments.telphone, title: '电话' },
      ],

      // immutable table
      detail: [
        {
          dataIndex: _pay.paytypeId,
          title: '类型',
          render: (text) => {
            if (text.map) {
              return text.map(key => msg.paytypeId[key] || key).join('/');
            }
            return text;
          },
        },
        { dataIndex: _pay.reimuserName, title: '成本中心' },
        {
          dataIndex: _pay.company,
          title: '付款公司',
          render: text => <CompanyValueToText value={text} />,
        },
        { dataIndex: _pay.payDate, title: '归属月份' },
        { dataIndex: _pay.money, title: '金额', render: value => <AmountFormat value={value} /> },
        { dataIndex: _pay.remark, title: '备注' },
        { dataIndex: _pay.vendorName, title: '收款方' },
        { dataIndex: _pay.bankNum, title: '银行账号' },
        { dataIndex: _pay.bankName, title: '银行名称' },
        { dataIndex: _pay.contacter, title: '联系人' },
        { dataIndex: _pay.telphone, title: '电话' },
      ],
    };
  }

  getColumns = (paytypeTotal) => {
    // 获取 paytype columns
    const paytypeColumns = Object.keys(paytypeTotal).map(dataIndex => ({
      dataIndex,
      className: 'tar',
      title: (
        <div className="total-amount-title">
          <span className="old" key="old">{dataIndex}</span>
          <span className="new" key="new">{format.money(paytypeTotal[dataIndex])}</span>
        </div>
      ),
      render: (t, $record) => {
        const $list = $record.get(dataIndex);
        if (!$list || $list.size === 0) return format.money(0);
        if ($list.size === 1) return format.money($list.getIn([0, 'amount']));
        if ($list.size > 1) {
          let total = 0;
          let listItem = $list.map($item => {
            if (!$item) return null;
            total = NP.plus(total, $item.get('amount'));
            return (
              <p key={$item.get('id')}>
                <span>{$item.get('id')}:</span><span>{format.money($item.get('amount'))}</span>
              </p>
            );
          });
          return (
            <Tooltip placement="bottom" title={<div className={style.amountList}>金额组成：{listItem}</div>}>
              {total}
            </Tooltip>
          );
        }
      },
    }));
    return [
      { dataIndex: 'no.', title: '序号', render: (t, r, index) => index + 1, fixed: 'left' },
      { dataIndex: 'reimuserId', title: '姓名', render: this.reimuserIdTableRender, fixed: 'left' },
      { dataIndex: 'vendorName', title: '收款方', path: ['vendor', 'name'] },
      { dataIndex: 'bankNum', title: '银行账号' },
      { dataIndex: 'bankName', title: '银行名称' },
    ]
      .concat(paytypeColumns).concat(
        { dataIndex: 'personalAmount', title: '汇总', className: 'tar', render: t => format.money(t), fixed: 'right' },
      );
  };
  reimuserIdTableRender = text => {
    if (!text) return text;
    const $item = this.props.setting.default.find($i => $i.get('id') === text);
    return $item ? $item.get('name') : text;
  };
  buildExpensesColumnDataSource = $value => {
    const paytypeTotal = {};
    let $viewDataSource = Immutable.Map();
    $value.forEach(($item) => {
      const reimuserId = $item.get('reimuserId');
      let key = $item.get('paytypeId');
      key = Immutable.List.isList(key) ? key.get(-1) : key; // 如果表格编辑中选择，则最后一个是paytypeId
      key = Array.isArray(key) ? key[key.length - 1] : key; // 如果表格编辑中选择，则最后一个是paytypeId
      paytypeTotal[key] = NP.plus(paytypeTotal[key] || 0, $item.get('money')); // typeId 金额汇总

      $viewDataSource = $viewDataSource.update(reimuserId, $oldItem => {
        $oldItem = $oldItem || Immutable.Map();

        // vendor的收款信息需要显示出来
        ['reimuserId', 'vendor', 'bankNum', 'bankName'].forEach(field => {
          $oldItem = $oldItem.set(field, $item.get(field));
        });

        // 统计单人的 paytypeId 费用
        const $amountItem = Immutable.fromJS([{ id: $item.get('formId') || 'new', amount: $item.get('money') }]);
        $oldItem = $oldItem.update(key, $list => ($list ? $list.concat($amountItem) : $amountItem));

        // 单人所有 payType的金额汇总
        let personalAmount = $oldItem.get('personalAmount') || 0;
        personalAmount = NP.plus($item.get('money'), personalAmount);
        $oldItem = $oldItem.set('personalAmount', personalAmount);
        return $oldItem;
      });
    });
    $viewDataSource = $viewDataSource.toList();
    return { dataSource: $viewDataSource, columns: this.getColumns(paytypeTotal) };
  };

  render() {
    const { payment } = this.props;
    const hasStatus = payment && (payment.get(_pay.status));
    const itemSpan = 8;
    // 根据 column 渲染页面元素
    const columnMap = column => {
      const text = payment.getIn($payments[column.dataIndex] || [column.dataIndex]);
      return (
        <Col key={column.dataIndex} span={column.span || itemSpan} className="payment-item">
          <span className="payment-label">{column.title}</span>
          <span className="payment-value">
            {column.render ? column.render(text, payment) : text}
          </span>
        </Col>
      );
    };

    // 付款信息部分
    let payDetail = null;
    if (payment.get('orderType') === config.orderType.Expense) { // 是否显示报销汇总
      payDetail = (
        <Col span={24} className="payment-item">
          <TableListImmutable
            pagination={false}
            {...this.buildExpensesColumnDataSource(payment.get(_pay.detail))}
          />
        </Col>
      );
    } else { // 显示更多付款列表
      payDetail = (
        <Col span={24} className="payment-item">
          <TableListImmutable pagination={false} columns={this.columns.detail} dataSource={payment.get(_pay.detail)} />
        </Col>
      );
    }
    let payList = this.columns.pay;
    if (payment.get('orderType') !== config.orderType.OverseasPayment) {
      payList = payList.filter(column => column.dataIndex !== 'amountCNY'); // 非外币移除等值人民币
    }
    if (payment.get('approStatus') !== config.approStatus.paySucceed) {
      payList = payList.filter(column => column.dataIndex !== 'bankCharge'); // 付款完成显示银行手续费
    }

    return (
      <div className="payment-read">

        {/* 头部申请单状态 */}
        {hasStatus && (
          <Alert
            type="info"
            message={(
              <dl className="payment-status">
                <dt>
                  <Badge
                    status={
                      payment.get(_pay.status) === config.approStatus.paySucceed ? 'success' :
                        paymentFormStatus.includes(payment.get(_pay.status)) ? 'default' : 'processing'
                    }
                  />
                  状态
                </dt>
                <dd> {msg.approStatus[payment.get(_pay.status)]}</dd>
                <dd> {payment.get(_pay.status)}</dd>
              </dl>)}
          />
        )}

        {/* 申请内容 */}
        <h4>申请内容</h4>
        <Row gutter={8} className="payment-row">
          {this.columns.content.map(columnMap)}
        </Row>

        {/* 付款信息 */}
        <h4>付款信息</h4>
        <Row gutter={8}>
          {payList.map(columnMap)}
          {/* 根据类型选择是否输出明细 */}
          {payDetail}
        </Row>
      </div>
    );
  }
}
