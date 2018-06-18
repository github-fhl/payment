import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button } from 'antd';
import PaymentList from 'components/PaymentList';
import { SimpleSearch } from 'components/SimpleForm';
import { config } from 'utils';
import { approDetail } from '../../services/detail';

const listFields = [
  config.listFields.id,
  config.listFields.paytypeId,
  config.listFields.vendorName,
  config.listFields.amount,
  config.listFields.description,
  config.listFields.createdAt,
  config.listFields.approStatus,
  config.listFields.invoiceStatus,
  config.listFields.currency,
];
const searchFields = [
  config.paymentFields.createdAt,
  config.paymentFields.description,
];

@connect(({ chief, loading }) => ({
  $list: chief.$startList,
  loading: loading.models.chief,
}))
export default class TableList extends PureComponent {
  state = {
    selectedRowKeys: [],
  };

  componentDidMount() {
    // this.onFetch();
  }

  onFetch = params => this.props.dispatch({
    type: 'chief/fetchStart',
    payload: params,
  });
  batchAction = () => {
    return approDetail({
      roleAction: 'chiefAppro',
      idArr: this.state.selectedRowKeys,
    }).then(e => {
      if (e.status === 'success') {
        this.setState({ selectedRowKeys: [] });
        this.props.dispatch({ type: 'user/getLog' });
        this.onFetch();
      }
    });
  };

  render() {
    const { $list, loading } = this.props;
    const props = {
      dataSource: $list,
      loading,
      rowKey: $record => $record.get('id'),
      rowSelection: {
        selectedRowKeys: this.state.selectedRowKeys,
        onChange: (selectedRowKeys) => {
          this.setState({ selectedRowKeys });
        },
      },
    };
    return (
      <Card bordered={false}>
        <SimpleSearch fetch={this.onFetch} searchFields={searchFields} />
        <div style={{ marginBottom: 16 }}>
          {
            this.state.selectedRowKeys.length > 0 && (
              <Button type="primary" onClick={this.batchAction}>批量审批</Button>
            )
          }
        </div>
        <PaymentList {...props} listFields={listFields} />
      </Card>
    );
  }
}
