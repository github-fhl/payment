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
  config.listFields.subjectStatus,
  config.listFields.currency,
  config.listFields.paidNo,
  config.listFields.bankName,
];
const searchFields = [
  config.paymentFields.createdAt,
  config.paymentFields.description,
  config.paymentFields.subjectId,
  config.paymentFields.amount,
  config.paymentFields.paidNo,
];


@connect(({ finance, loading }) => ({
  $list: finance.$endList,
  loading: loading.models.finance,
}))
export default class TableList extends PureComponent {
  componentDidMount() {
    // this.onFetch();
  }

  onFetch = params => this.props.dispatch({
    type: 'finance/fetchEnd',
    payload: params,
  });

  render() {
    const { $list, loading } = this.props;
    const props = { dataSource: $list, loading };
    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <SimpleSearch fetch={this.onFetch} searchFields={searchFields} />
          <PaymentList
            {...props}
            listFields={listFields}
            rowClassName={$record => {
              if (
                ($record.get(config.paymentFields.subjectStatus) === 'n' ||
                  $record.get(config.paymentFields.subjectStatus) === 'f') &&
                $record.get('approStatus') === config.approStatus.paySucceed
              ) {
                return 'highlight-row';
              } else {
                return '';
              }
            }}
          />
        </Card>
      </PageHeaderLayout>
    );
  }
}
