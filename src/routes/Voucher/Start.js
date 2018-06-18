import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Card, Button } from 'antd';
import VoucherList from 'components/VoucherList';
import { SimpleSearch } from 'components/VoucherSimpleForm';
import { config, format } from 'utils';
import styles from './styles.less';


const searchFields = [
  config.voucherFields.voucherId,
  config.voucherFields.voucherDate,
  config.voucherFields.bankAccount,
  config.voucherFields.amount,
];

const columns = [
  { dataIndex: 'id', title: '凭证号', render: (t, $r) => <Link to={`/voucher/start/${$r.get('id')}`}>{t}</Link> },
  { dataIndex: 'voucherDate', title: '凭证日期', render: t => format.date(t) },
  { dataIndex: 'bankAccount', title: '银行账号' },
  { dataIndex: 'amount', title: '金额', render: t => format.money(t), className: 'tar' },
  { dataIndex: 'remark', title: '备注' },
];

@connect(({ voucher, loading }) => ({
  $list: voucher.$startList,
  loading: loading.models.voucher,
}))
export default class TableList extends PureComponent {
  state = {
    selectedRowKeys: [],
  };
  componentWillMount() {
    this.onFetch({
      transactionType: 'Payment' });
  }
  onSelectChange = (selectedRowKeys) => this.setState({ selectedRowKeys });

  onFetch = params => this.props.dispatch({
    type: 'voucher/fetchStart',
    payload: params,
  });

  render() {
    const { $list, loading } = this.props;
    const props = { dataSource: $list, loading };
    const { selectedRowKeys } = this.state;
    return (
      <Card bordered={false}>
        <div className={styles.operation}>
          <Button >打印</Button>
          <Button >导出</Button>
        </div>
        <SimpleSearch fetch={this.onFetch} searchFields={searchFields} />
        <VoucherList
          rowKey={record => record.get('voucherId')}
          rowSelection={{
            onChange: this.onSelectChange,
            selectedRowKeys,
            hideDefaultSelections: true,
            onSelectAll: (selected, selectedRows) =>
              this.setState({ selectedRowKeys: selected ? selectedRows.map($item => $item.get('voucherId')) : [] }),
          }}
          {...props}
          columns={columns}
        />
      </Card>
    );
  }
}
