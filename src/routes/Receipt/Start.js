import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Card, Button } from 'antd';
import PaymentList from 'components/PaymentList';
import { SimpleSearch } from 'components/SimpleForm';
import { config, format, downloadUrl } from 'utils';

const searchFields = [
  config.paymentFields.createdAt,
  config.paymentFields.invoice,
  config.paymentFields.description,
  config.paymentFields.amount,
];

const columns = [
  { dataIndex: 'paidNo', title: '凭证号', render: (t, $r) => <Link to={`/receipt/start/${$r.get('id')}`}>{t}</Link> },
  { dataIndex: 'collectDate', title: '收款日期', render: t => format.date(t) },
  { dataIndex: 'currency', title: '币种' },
  { dataIndex: 'amount', title: '金额', render: t => format.money(t), className: 'tar' },
  { dataIndex: 'amountCNY', title: '等值人民币', render: t => format.money(t), className: 'tar' },
  { dataIndex: 'subjectName', title: '收款银行' },
  { dataIndex: 'description', title: '描述' },
  {
    dataIndex: 'filePath',
    title: '文件',
    render: url => url && <a onClick={() => downloadUrl(`/api/${url}`)}>查看</a>,
  },
  { dataIndex: 'subjectStatus', title: '凭证制单' },
];

@connect(({ receipt, loading }) => ({
  $list: receipt.$startList,
  loading: loading.models.receipt,
}))
export default class TableList extends PureComponent {
  componentDidMount() {
    // this.onFetch();
  }

  onFetch = params => this.props.dispatch({
    type: 'receipt/fetchStart',
    payload: params,
  });

  render() {
    const { $list, loading } = this.props;
    const props = { dataSource: $list, loading };
    return (
      <Card bordered={false}>
        <div style={{ marginBottom: 16 }}>
          <Link to="/receipt/new">
            <Button type="primary">创建</Button>
          </Link>
        </div>
        <SimpleSearch fetch={this.onFetch} searchFields={searchFields} />
        <PaymentList
          {...props}
          columns={columns}
          rowClassName={$record => ($record.get(config.paymentFields.subjectStatus) === 'n' ? 'highlight-row' : '')}
        />
      </Card>
    );
  }
}
