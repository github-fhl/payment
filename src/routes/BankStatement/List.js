import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Card, Button, Popconfirm, message } from 'antd';
import moment from 'moment';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { TableListImmutable } from 'components/TableList';
import { format, config } from 'utils';
import { getVoucher } from '../../services/bankStatement';
import Search from './components/Search';
import InputRate from './components/InputRate';
import styles from './List.less';

moment.locale('en');

function dragDirection(
  dragIndex,
  hoverIndex,
  initialClientOffset,
  clientOffset,
  sourceClientOffset,
) {
  const hoverMiddleY = (initialClientOffset.y - sourceClientOffset.y) / 2;
  const hoverClientY = clientOffset.y - sourceClientOffset.y;
  if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY) {
    return 'downward';
  }
  if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY) {
    return 'upward';
  }
}

let BodyRow = props => {
  const {
    isOver,
    connectDragSource,
    connectDropTarget,
    moveRow,
    dragRow,
    clientOffset,
    sourceClientOffset,
    initialClientOffset,
    ...restProps
  } = props;
  const style = { ...restProps.style, cursor: 'move' };

  let className = restProps.className;
  if (isOver && initialClientOffset) {
    const direction = dragDirection(
      dragRow.index,
      restProps.index,
      initialClientOffset,
      clientOffset,
      sourceClientOffset,
    );
    if (direction === 'downward') {
      className += ' drop-over-downward';
    }
    if (direction === 'upward') {
      className += ' drop-over-upward';
    }
  }

  return connectDragSource(
    connectDropTarget(<tr {...restProps} className={className} style={style} />),
  );
};
const rowSource = {
  beginDrag(props) {
    return {
      index: props.index,
    };
  },
};

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) return;
    props.moveRow(dragIndex, hoverIndex);
    monitor.getItem().index = hoverIndex;
  },
};

BodyRow = DropTarget('row', rowTarget, (targetConnect, monitor) => ({
  connectDropTarget: targetConnect.dropTarget(),
  isOver: monitor.isOver(),
  sourceClientOffset: monitor.getSourceClientOffset(),
}))(
  DragSource('row', rowSource, (sourceConnect, monitor) => ({
    connectDragSource: sourceConnect.dragSource(),
    dragRow: monitor.getItem(),
    clientOffset: monitor.getClientOffset(),
    initialClientOffset: monitor.getInitialClientOffset(),
  }))(BodyRow),
);


@connect(({ bankStatement: { $list, isForeignBank, listCount, listCurrentPage, searchParams }, loading, global }) => ({
  $list,
  isForeignBank,
  listCount,
  listCurrentPage,
  searchParams,
  pagination: global.pagination,
  loading: loading.models.bankStatement,
}))
@DragDropContext(HTML5Backend)
export default class TableList extends PureComponent {
  state = {
    selectedRowKeys: [],
  };

  componentWillMount() {
    this.foreignBankColumns = [
      {
        dataIndex: 'index',
        title: '流水号',
        render: (t, $r) => <Link to={`/bank-statement/start/${$r.get('id')}`}>{t}</Link>,
      },
      { dataIndex: 'date', title: '交易日期', render: t => format.date(t, 'D-MMM-YY') },
      { dataIndex: 'voucherDate', title: '凭证日期', render: t => format.date(t, 'D-MMM-YY') },
      {
        dataIndex: 'costType',
        title: '费用类型',
      },
      { dataIndex: 'paidNo', title: '凭证号', render: (t, $r) => <Link to={`/voucher/start/${$r.get('id')}`}>{t}</Link> },
      { dataIndex: 'description', title: '描述' },
      {
        dataIndex: 'commonId',
        title: '收付款单号',
        render: (t, $record) => {
          if ($record.get('transactionType') === config.transactionType.Receipt) {
            return <Link to={`/receipt/start/${t}`}>{t}</Link>;
          } else if ($record.get('transactionType') === config.transactionType.Payment) {
            return <Link to={`/paying/end/${t}`}>{t}</Link>;
          }
        },
      },
      {
        dataIndex: 'receiptAmount',
        title: '收款金额',
        className: `tar ${styles.green}`,
        render: (t, $record) => {
          if ($record.get('transactionType') === config.transactionType.Receipt) {
            return format.money($record.get('money'));
          } else {
            return format.money();
          }
        },
      },
      {
        dataIndex: 'payAmount',
        title: '付款金额',
        className: `tar ${styles.red}`,
        render: (t, $record) => {
          if ($record.get('transactionType') === config.transactionType.Payment) {
            return format.money($record.get('money'));
          } else {
            return format.money();
          }
        },
      },
      {
        dataIndex: 'bankCharge',
        title: '银行手续费',
        className: 'tar',
        render: (t) => format.money(t),
      },
      { dataIndex: 'balance', title: '账户余额', render: t => format.money(t), className: `tar ${styles.strong}` },
      { dataIndex: 'amountCNY', title: '等值人民币', render: m => format.money(m), className: 'tar' },
      {
        dataIndex: 'operation',
        title: '操作',
        render: (text, $record) => {
          return (
            <Fragment>
              <Link to={`/bank-statement/start/${$record.get('id')}`}>编辑</Link>&nbsp;|&nbsp;
              <Popconfirm title="确认删除吗？" onConfirm={this.onDelete($record)}>
                <a>删除</a>
              </Popconfirm>
            </Fragment>
          );
        },
      },
    ];
    this.columns = this.foreignBankColumns.filter(item => item.dataIndex !== 'amountCNY');
  }

  componentDidMount() {
    // this.onFetch(); //测试代码，默认不fetch
  }

  onFetch = params => this.props.dispatch({
    type: 'bankStatement/fetchStart',
    payload: params,
  });
  onDelete = $record => () => this.props.dispatch({
    type: 'bankStatement/delete',
    payload: { id: $record.get('id') },
  });
  onSelectChange = (selectedRowKeys) => this.setState({ selectedRowKeys });
  onSearchChange = payload => this.props.dispatch({ type: 'bankStatement/changeSearch', payload });
  onTableChange = (pagination) => this.onFetch({ offset: (pagination.current - 1) * this.props.pagination.pageSize });
  getVoucher = () => {
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length < 1) return message.error('请选择制作凭证的流水号');
    // return message.error('接口还未完成');
    getVoucher({ bankStatementIds: JSON.stringify(selectedRowKeys) }).then(e => {
      if (e.status === 'success') {
        this.setState({ selectedRowKeys: [] });
        // this.props.dispatch(routerRedux(`/voucher/${e.id}`));
        localStorage.setItem('aggregatedPaymentInfos', JSON.stringify((e.obj.aggregatedPaymentInfos)));
        localStorage.setItem('formatedReceiptInfos', JSON.stringify(e.obj.formatedReceiptInfos));
        localStorage.setItem('voucherinfo', JSON.stringify(e.obj.voucher));
        localStorage.setItem('bankStatementIds', JSON.stringify(e.obj.bankStatementIds));
        localStorage.setItem('colNames', JSON.stringify(e.obj.colNames));
      }
    });
  };

  components = {
    body: {
      row: BodyRow,
    },
  };
  moveRow = (dragIndex, hoverIndex) => {
    const { $list, dispatch } = this.props;
    const action = new Promise(resolve => dispatch({
      type: 'bankStatement/changeIndex',
      resolve,
      payload: {
        id: $list.getIn([dragIndex, 'id']),
        index: $list.getIn([hoverIndex, 'index']),
      },
    }));
    action.then(e => {
      if (e && e.status === 'success') this.onFetch();
    });
  };


  render() {
    const { $list, loading, isForeignBank, pagination, listCount, listCurrentPage, searchParams } = this.props;
    const { selectedRowKeys } = this.state;

    // 列表参数
    const tableProps = {
      columns: isForeignBank ? this.foreignBankColumns : this.columns,
      dataSource: $list,
      loading,

      // 拖拽表格
      components: this.components,
      onRow: (record, index) => ({
        index,
        moveRow: this.moveRow,
      }),

      // 翻页配置
      onChange: this.onTableChange,
      pagination: { ...pagination, total: listCount, current: listCurrentPage },

      // 表格选择项配置
      rowKey: record => record.get('id'),
      rowSelection: {
        onChange: this.onSelectChange,
        selectedRowKeys,
        hideDefaultSelections: true,
        onSelectAll: (selected, selectedRows) =>
          this.setState({ selectedRowKeys: selected ? selectedRows.map($item => $item.get('id')) : [] }),
      },
    };
    return (
      <Card bordered={false}>
        <div style={{ marginBottom: 16 }}>
          <Link to="/voucher/new">
            <Button type="primary" onClick={this.getVoucher}>制作凭证</Button>
          </Link>
          <Link to="/bank-statement/new">
            <Button style={{ marginLeft: 10, marginRight: 10 }}>创建银行流水</Button>
          </Link>
          <InputRate>
            <Button>录入汇率</Button>
          </InputRate>
        </div>
        <Search fetch={this.onFetch} onChange={this.onSearchChange} value={searchParams} />
        <TableListImmutable{...tableProps} />
      </Card>
    );
  }
}
