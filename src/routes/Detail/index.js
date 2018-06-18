import React from 'react';
import { connect } from 'dva';
import _ from 'lodash';
import { Card, Spin } from 'antd';
import { config, format } from 'utils';
import Immutable from 'immutable';
import { TableListImmutable } from 'components/TableList';
import { OrderView, OrderForm } from 'components/Order';
import PaidSuccess from './Action/PaidSuccess';
import PrintOrder from './Action/PrintOrder';
import SubmitOrder from './Action/SubmitOrder';
import AbandonOrder from './Action/AbandonOrder';
import SaveOrder from './Action/SaveOrder';
import Approval from './Action/Approval';
import Invoice from './Action/Invoice';
import ReceiveOrder from './Action/ReceiveOrder';
import Voucher from './Action/Voucher';
import Paid from './Action/Paid';
import FinishReturn from './Action/FinishReturn';
import FinishSetAmount from './Action/FinishSetAmount';
import FinishSetDate from './Action/FinishSetDate';
import ExportAfterPay from './Action/ExportAfterPay';
import ViewPayBank from './Action/ViewPayBank';
import ViewSubject from './Action/ViewSubject';
import UpdateVendor from './Action/UpdateVendor';
import styles from './index.less';

// 申请单功能组件
const actionList = {
  PaidSuccess, // 付款完成
  UpdateVendor, // 付款退回后，申请人修改 order detail 信息
  PrintOrder, // 打印申请单
  SubmitOrder, // 提交审批申请单
  AbandonOrder, // 作废申请单
  SaveOrder, // 保存申请单
  Approval, // 审批
  Invoice, // 发票管理功能
  ReceiveOrder, // 收到实体申请单功能
  Voucher, // 设置财务科目功能
  Paid, // 出纳付款
  FinishReturn, // 付款退回
  FinishSetAmount, // 付款后出纳修改付款金额
  FinishSetDate, // 付款后出纳修改付款日期
  ExportAfterPay, // 导出付款银行信息
  ViewPayBank, // 查看付款银行信息
  ViewSubject, // 查看银行科目信息
};
const actionName = {
  UpdateVendor: 'UpdateVendor',
  PrintOrder: 'PrintOrder',
  SubmitOrder: 'SubmitOrder',
  AbandonOrder: 'AbandonOrder',
  SaveOrder: 'SaveOrder',
  Approval: 'Approval',
  Invoice: 'Invoice',
  ReceiveOrder: 'ReceiveOrder',
  Voucher: 'Voucher',
  Paid: 'Paid',
  PaidSuccess: 'PaidSuccess',
  FinishReturn: 'FinishReturn',
  FinishSetAmount: 'FinishSetAmount',
  FinishSetDate: 'FinishSetDate',
  ExportAfterPay: 'ExportAfterPay',
  ViewPayBank: 'ViewPayBank',
  ViewSubject: 'ViewSubject',
};

// 页面包含的功能列表 - 功能显示顺序以此数组为准
const pageActionName = {
  'my-list': [actionName.SubmitOrder, actionName.SaveOrder, actionName.AbandonOrder, actionName.PrintOrder, actionName.UpdateVendor],
  supervisor: [actionName.Approval],
  cashier: [actionName.Approval, actionName.Invoice, actionName.ReceiveOrder],
  'inter-company': [actionName.Approval],
  finance: [actionName.Approval, actionName.Voucher],
  chief: [actionName.Approval, actionName.ViewSubject],
  paying: [
    actionName.PaidSuccess,
    actionName.Paid,
    actionName.FinishReturn,
    actionName.FinishSetAmount,
    actionName.FinishSetDate,
    actionName.ExportAfterPay,
    actionName.Invoice,
    actionName.ViewPayBank,
    actionName.ViewSubject,
  ],
};


// 申请单状态包含的功能列表
const statusActionName = {
  toSubmit: [actionName.SubmitOrder, actionName.AbandonOrder, actionName.SaveOrder], // 已创建，待提交
  toApproByManager: [ // 已提交，待主管审批
    actionName.Approval,
    actionName.Invoice,
  ],
  toApproByIC: [actionName.Approval], // 集团往来会计审核
  refusedByIC: [actionName.SaveOrder, actionName.SubmitOrder],
  refusedByManager: [actionName.SubmitOrder, actionName.AbandonOrder, actionName.SaveOrder], // 主管否决，待提交
  toApproByCashier: [actionName.Approval, actionName.Invoice, actionName.ReceiveOrder], // 主管已批准，待出纳审核
  refusedByCashier: [actionName.SubmitOrder, actionName.AbandonOrder, actionName.SaveOrder], // 出纳否决，待提交
  toApproByFinance: [actionName.Approval], // 出纳已审核，待财务审核
  refusedByFinance: [actionName.SubmitOrder, actionName.AbandonOrder, actionName.SaveOrder], // 财务否决，待提交
  toApproByChief: [actionName.Approval], // 财务已审核，待财务总监审批
  refusedByChief: [actionName.SubmitOrder, actionName.AbandonOrder, actionName.SaveOrder], // 财务总监否决，待提交
  toExportByCashier: [actionName.Invoice], // 财务总监已审批，待出纳导出
  toPayByCashier: [actionName.Paid, actionName.Invoice], // 出纳已导出，待出纳付款

  payFailed: [actionName.UpdateVendor], // 出纳付款失败，待出纳导出（申请人修改信息）
  updatedByApplicant: [
    actionName.PaidSuccess,
    actionName.FinishReturn,
    actionName.FinishSetDate,
    actionName.Invoice,
    actionName.ExportAfterPay,
    actionName.FinishSetAmount,
  ], // 申请人已修改信息，待出纳导出
  toConfirmSucceed: [
    actionName.PaidSuccess,
    actionName.FinishReturn,
    actionName.FinishSetDate,
    actionName.Invoice,
    actionName.ExportAfterPay,
    actionName.FinishSetAmount,
  ],
  paySucceed: [
    actionName.ViewSubject,
    actionName.ViewPayBank,
    actionName.Invoice,
    actionName.Voucher,

  ], // 出纳付款成功
  abandoned: [], // 已废弃
};

const approPageState = {
  supervisor: [config.approStatus.toApproByManager],
  cashier: [config.approStatus.toApproByCashier],
  'inter-company': [config.approStatus.toApproByIC],
  finance: [config.approStatus.toApproByFinance],
  chief: [config.approStatus.toApproByChief],
};

const getPageField = pathname => pathname.split('/').filter(e => e)[0];
const getPageAction = (pathname, status) => {
  const filed = getPageField(pathname);
  let list = pageActionName[filed] || [];
  if (list.includes(actionName.Approval)) { // 如果包含审批操作，则检查当前页面 是否符合审批状态。
    const approState = approPageState[filed];
    if (approState && !approState.includes(status)) list = _.difference(list, [actionName.Approval]);
  }
  return list;
};

const pathId = 'match.params.id';
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

  componentDidMount() {
    const id = _.get(this.props, pathId);
    this.props.dispatch({
      type: 'detail/fetch',
      payload: { id },
    });
  }

  componentWillReceiveProps(nextProps) {
    const id = _.get(nextProps, pathId);
    if (id !== _.get(this.props, pathId)) {
      this.props.dispatch({ type: 'detail/clear' });
      this.props.dispatch({
        type: 'detail/fetch',
        payload: { id },
      });
    }
  }

  onFieldsChange = (values) => {
    let $payment = this.props.$payment;
    for (let key in values) {
      $payment = $payment.set(key, values[key].value);
    }
    this.props.dispatch({
      type: 'detail/save',
      payload: { $payment },
    });
  };

  render() {
    const { loading, $payment, location, dispatch, setting, match } = this.props;
    const orderState = $payment.get('approStatus');

    // 获取页面中包含的功能
    const orderAction = _.intersection(getPageAction(location.pathname, orderState), statusActionName[orderState] || []);
    const actionRender = orderAction.map(key => {
      const ActionComponent = actionList[key];
      return (
        <ActionComponent
          key={key}
          $payment={$payment}
          dispatch={dispatch}
          setting={setting}
          match={match} // 审批用
          getForm={() => this.form} // Voucher组件使用
        />);
    });

    return (
      <Spin spinning={!!loading}>
        <Card bordered={false}>
          {
            orderAction.includes(actionName.SaveOrder) ?
              (
                <OrderForm
                  payment={$payment}
                  onFieldsChange={this.onFieldsChange}
                  wrappedComponentRef={e => this.form = e && e.props.form}
                />
              ) :
              (<OrderView payment={$payment} setting={setting} />)
          }
        </Card>

        {
          actionRender.length > 0 && (
            <Card bordered={false} style={{ marginTop: 10 }} className={styles.orderAction}>
              {actionRender}
            </Card>)
        }

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
