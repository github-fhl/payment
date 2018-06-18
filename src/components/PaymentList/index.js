import React, { PureComponent } from 'react';
import { Link } from 'dva/router';
import { connect } from 'dva';
import { TableListImmutable } from 'components/TableList';
import { format, msg } from '../../utils';
import styles from './styles.less';

@connect(({ global, routing }, { pagination }) => ({
  pathname: routing.location.pathname,
  pagination: { ...global.pagination, ...pagination },
}))

export default class TableList extends PureComponent {
  componentWillMount() {
    const { pathname, operate, listFields = [] } = this.props;
    this.columns = [
      { dataIndex: 'id', width: 110, title: 'ID', render: id => <Link to={`${pathname}/${id}`}>{id}</Link> },
      {
        dataIndex: 'paytypeId',
        width: 130,
        title: '类型',
        render: (text, record) => {
          const category = record.getIn(['orderdetails', 0, 'paytype', 'category']);
          const id = record.getIn(['orderdetails', 0, 'paytypeId']);
          return [msg.paytypeId[category], id].filter(e => e).join(' / ');
        },
      },
      {
        dataIndex: 'vendorName',
        title: '收款方',
        path: ['orderdetails', 0, 'vendor', 'name'],
      },
      {
        dataIndex: 'currency',
        title: '币种',
      },
      { dataIndex: 'amount', title: '总额', width: 100, render: t => format.money(t), className: 'tar' },
      { dataIndex: 'description', title: '描述' },
      { dataIndex: 'createdAt', title: '创建日期', width: 100, render: t => format.date(t) },
      { dataIndex: 'approStatus', title: '状态', render: t => msg.approStatus[t] },
      { dataIndex: 'invoiceStatus', title: '发票' },
      { dataIndex: 'printStatus', title: '打印' },
      { dataIndex: 'receiveOrderStatus', title: '实体订单' },
      { dataIndex: 'exportStatus', title: '导出状态' },
      {
        dataIndex: 'bankName',
        title: '付款银行',
        render: (t, $record) => {
          const $subjects = $record.get('ordersubjects');
          const $credit = $subjects && $subjects.find($item => $item.get('type') === 'credit');
          if ($credit) return $credit.getIn(['subject', 'name']);
        },
      },
      { dataIndex: 'subjectStatus', title: '凭证制单' },
      { dataIndex: 'paidNo', title: '凭证号' },
      operate,
    ].filter(e => e && (listFields.includes(e.dataIndex) || e.dataIndex === 'operate'));
  }

  render() {
    const { columns = this.columns, listFields, ...props } = this.props;
    return (
      <div className={styles.tableList}>
        <TableListImmutable
          columns={columns}
          {...props}
        />
      </div>
    );
  }
}
