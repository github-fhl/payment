import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link, routerRedux } from 'dva/router';
import { Card, Button } from 'antd';
import PaymentList from 'components/PaymentList';
import { SimpleSearch } from 'components/SimpleForm';
import { config } from 'utils';
import { copyPaymentToStorage } from '../../services/new';

const listFields = [
  config.listFields.id,
  config.listFields.paytypeId,
  config.listFields.vendorName,
  config.listFields.amount,
  config.listFields.description,
  config.listFields.createdAt,
  config.listFields.approStatus,
  config.listFields.invoiceStatus,
  config.listFields.printStatus,
  config.listFields.currency,
];

const searchFields = [
  config.paymentFields.createdAt,
  config.paymentFields.description,
  config.paymentFields.amount,
];

@connect(({ myList, loading }) => ({
  $list: myList.$endList,
  loading: loading.models.myList,
}))
export default class TableList extends PureComponent {
  onFetch = params => this.props.dispatch({
    type: 'myList/fetchEnd',
    payload: params,
  });
  onCopy = $render => {
    copyPaymentToStorage($render);
    this.props.dispatch(routerRedux.push('/my-list/new'));
  };

  render() {
    const { $list, loading } = this.props;
    const operate = {
      dataIndex: 'operate',
      title: '操作',
      render: (text, $render) => <a onClick={() => this.onCopy($render)}>复制</a>,
    };
    const props = { dataSource: $list, loading, operate };
    return (
      <Card bordered={false}>
        <div style={{ marginBottom: 16 }}>
          <Link to="/my-list/new">
            <Button type="primary">创建</Button>
          </Link>
        </div>
        {/* 搜索 */}
        <SimpleSearch fetch={this.onFetch} searchFields={searchFields} />
        <PaymentList {...props} listFields={listFields} />
      </Card>
    );
  }
}
