import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card } from 'antd';
import PaymentList from 'components/PaymentList';
import { SimpleSearch } from 'components/SimpleForm';
import { config } from 'utils';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

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
  config.paymentFields.invoice,
  config.paymentFields.description,
  config.paymentFields.amount,
];


@connect(({ cashier, loading }) => ({
  $list: cashier.$endList,
  loading: loading.models.cashier,
}))
export default class TableList extends PureComponent {
  componentDidMount() {
    // this.onFetch();
  }

  onFetch = params => this.props.dispatch({
    type: 'cashier/fetchEnd',
    payload: params,
  });

  render() {
    const { $list, loading } = this.props;
    const props = { dataSource: $list, loading };
    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <SimpleSearch fetch={this.onFetch} searchFields={searchFields} />
          <PaymentList {...props} listFields={listFields} />
        </Card>
      </PageHeaderLayout>
    );
  }
}
