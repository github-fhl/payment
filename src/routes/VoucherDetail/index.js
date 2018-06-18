import React from 'react';
import { connect } from 'dva';
import { Card, Spin } from 'antd';
import { format } from 'utils';
import Immutable from 'immutable';
import OrderForm from 'components/VoucherSimpleForm/OrderForm';
import { TableListImmutable } from 'components/TableList';
import Voucher from './Action/Voucher';

const logColumns = [{
  dataIndex: 'operation',
  title: '操作类型',
}, {
  dataIndex: 'operator',
  title: '操作人',
}, {
  dataIndex: 'remark',
  title: '备注',
}, {
  dataIndex: 'createdAt',
  title: '操作时间',
  render: t => format.date(t, 'YYYY-MM-DD HH:mm:ss'),
}];


@connect(({ detail, loading, setting }) => ({
  $payment: detail.$payment,
  loading: loading.models.detail,
  setting,
}))
export default class Order extends React.PureComponent {
  static defaultProps = {
    $payment: Immutable.Map(),
  };

  render() {
    const { loading, $payment, dispatch, setting, match } = this.props;
    return (
      <Spin spinning={!!loading}>
        <Card bordered={false}>
          <OrderForm
            payment={$payment}
            onFieldsChange={this.onFieldsChange}
            wrappedComponentRef={e => this.form = e && e.props.form}
          />
        </Card>
        <Card bordered={false} style={{ marginTop: 10 }} >
          <Voucher
            $payment={$payment}
            dispatch={dispatch}
            setting={setting}
            match={match} // 审批用
            getForm={() => this.form} // Voucher组件使用
          />
        </Card>
        <Card bordered={false} style={{ marginTop: 26 }} title="付款数据源">
          <TableListImmutable
            size="small"
            columns={logColumns}
            dataSource={$payment.get('applylogs')}
            pagination={{ pageSize: 5 }}
          />
        </Card>
        <Card bordered={false} style={{ marginTop: 26 }} title="收款数据源">
          <TableListImmutable
            size="small"
            columns={logColumns}
            dataSource={$payment.get('applylogs')}
            pagination={{ pageSize: 5 }}
          />
        </Card>
        <Card bordered={false} style={{ marginTop: 26 }} title="操作日志">
          <TableListImmutable
            size="small"
            columns={logColumns}
            dataSource={$payment.get('applylogs')}
            pagination={{ pageSize: 5 }}
          />
        </Card>
      </Spin>
    );
  }
}
