import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Button, message } from 'antd';
import PaymentList from 'components/PaymentList';
import { SimpleSearch } from 'components/SimpleForm';
import PaidModal from 'components/OrderAction/PaidModal';
import { config, downloadUrl } from 'utils';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import BatchSetAmountModal from '../Detail/components/BatchSetAmountModal';

const listFields = [
  config.listFields.id,
  config.listFields.paytypeId,
  config.listFields.vendorName,
  config.listFields.amount,
  config.listFields.description,
  config.listFields.createdAt,
  config.listFields.approStatus,
  config.listFields.invoiceStatus,
  config.listFields.exportStatus,
  config.listFields.currency,
];
const searchFields = [
  config.paymentFields.createdAt,
  config.paymentFields.description,
];

@connect(({ paying, loading }) => ({
  $list: paying.$startList,
  loading: loading.models.paying,
}))
export default class TableList extends PureComponent {
  state = {
    selectedRowKeys: [],
  };

  componentDidMount() {
    // this.onFetch();
  }

  onFetch = params => this.props.dispatch({
    type: 'paying/fetchStart',
    payload: params,
  });
  onPaid = (values) => {
    const { dispatch } = this.props;
    // 出纳付款
    return new Promise(resolve => {
      dispatch({ type: 'detail/paid', payload: values, resolve });
    })
      .then(e => {
        if (e.status === 'success') {
          this.props.dispatch({ type: 'user/getLog' });
          this.onFetch();
        }
        return e;
      });
  };
  exportBatchAction = () => {
    const { $list } = this.props;
    const { selectedRowKeys } = this.state;

    // 验证参数正确
    const exportStatus = [config.approStatus.updatedByApplicant, config.approStatus.toConfirmSucceed];
    const batchId = $list.filter($item =>
      selectedRowKeys.includes($item.get('id')) && exportStatus.includes($item.get('approStatus')),
    ).map($item => $item.get('id')).toArray();
    if (batchId.length < 1) return message.error('选中项没有需要导出的申请单');

    // 导出申请单
    const action = new Promise(resolve => this.props.dispatch({
      type: 'detail/exportAfterPay',
      resolve,
      payload: { orderIdArr: JSON.stringify(batchId) },
    }));
    action.then(e => {
      if (e.status === 'success') {
        downloadUrl(`/api/${e.path}`);
        this.setState({ selectedRowKeys: [] });
        this.onFetch();
      }
    });
  };
  batchPaySuccess = $list => {
    const { dispatch } = this.props;
    let amountCNY = {};
    let bankCharge = {};
    let idArr = [];
    $list.forEach($item => {
      const id = $item.get('id');
      idArr.push(id);
      if ($item.get('amountCNY')) amountCNY[id] = $item.get('amountCNY');
      bankCharge[id] = $item.get('bankCharge') || 0;
    });

    // 出纳付款
    return new Promise(resolve => dispatch({
      type: 'detail/paidSuccess',
      payload: { idArr, amountCNY, bankCharge },
      resolve,
    }))
      .then(e => {
        if (e.status === 'success') {
          dispatch({ type: 'user/getLog' });
          this.onFetch();
        }
        return e;
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
    const selectPayList = $list.filter($item =>
      this.state.selectedRowKeys.includes($item.get('id')) && $item.get('approStatus') === config.approStatus.toPayByCashier,
    ).toArray();
    const selectPaySuccessList = $list.filter($item =>
      this.state.selectedRowKeys.includes($item.get('id')) &&
      ([config.approStatus.toConfirmSucceed, config.approStatus.updatedByApplicant].includes($item.get('approStatus'))),
    );

    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <SimpleSearch fetch={this.onFetch} searchFields={searchFields} />
          <div style={{ marginBottom: 16 }}>
            {
              this.state.selectedRowKeys.length > 0 && (
                <Fragment>
                  <PaidModal
                    payments={selectPayList}
                    onPaid={this.onPaid}
                  >
                    <Button type="primary">付款</Button>
                  </PaidModal>
                  <Button onClick={this.exportBatchAction} style={{ marginLeft: 10, marginRight: 10 }}>导出</Button>

                  <BatchSetAmountModal $list={selectPaySuccessList} onOk={this.batchPaySuccess}>
                    <Button type="primary">确认付款</Button>
                  </BatchSetAmountModal>

                  <span style={{ fontSize: 16, marginLeft: 10, lineHeight: '31px' }}>
                    已选择
                    <span style={{ color: '#108ee9' }}>
                      {this.state.selectedRowKeys.length}
                    </span>
                    项
                  </span>
                </Fragment>
              )
            }
          </div>
          <PaymentList {...props} listFields={listFields} />
        </Card>
      </PageHeaderLayout>
    );
  }
}
