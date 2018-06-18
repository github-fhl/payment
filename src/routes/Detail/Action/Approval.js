import React, { Fragment } from 'react';
import { Button, Input, message } from 'antd';
import { routerRedux } from 'dva/router';
import { config } from 'utils';

const { TextArea } = Input;
// 页面包含的功能列表
const getPageField = pathname => pathname.split('/').filter(e => e)[0];
const pageApproRoles = {
  supervisor: { appro: 'managerAppro', refuse: 'managerRefuse' },
  cashier: { appro: 'cashierAppro', refuse: 'cashierRefuse' },
  'inter-company': { appro: 'icAppro', refuse: 'icRefuse' },
  finance: { appro: 'financeAppro', refuse: 'financeRefuse' },
  chief: { appro: 'chiefAppro', refuse: 'chiefRefuse' },
};

export default class Approval extends React.PureComponent {
  state = {
    rejectRemark: '',
  };

  componentWillMount() {
    this.setState({ rejectRemark: '' });
  }

  onChange = (e) => {
    this.setState({ rejectRemark: e.target.value });
  };
  onAppro = type => {
    const { dispatch, match: { path }, $payment } = this.props;
    const rejectRemark = this.state.rejectRemark.trim();
    if (type === 'refuse' && !rejectRemark) return message.error('请填写备注');
    let payload = {
      actionField: getPageField(path), // 获取角色的动作
      rejectRemark,
    };
    payload.roleAction = pageApproRoles[payload.actionField][type];

    // 如果出纳审核外币申请单，则去发给 集团往来会计审核
    if (
      $payment.get('orderType') === config.orderType.OverseasPayment &&
      payload.actionField === 'cashier' &&
      type === 'appro'
    ) payload.roleAction = 'cashierApproToIC';

    // 如果财务审核Expense申请单，则调用不同的的接口
    if (
      $payment.get('orderType') === config.orderType.Expense &&
      payload.actionField === 'finance'
    ) {
      payload.roleAction = 'expenses/stateMachine';
      if (type === 'appro') {
        payload.suffix = 'financeAppro';
      } else {
        payload.suffix = 'financeRefuse';
      }
    }

    // 审批操作
    const action = new Promise(resolve => dispatch({ type: 'detail/appro', resolve, payload }));
    action.then(e => {
      if (e.status === 'success') dispatch(routerRedux.push(path.replace(/\/:id/, '')));
    });
  };

  render() {
    return (
      <Fragment>
        <TextArea
          value={this.state.rejectRemark}
          placeholder="输入备注"
          autosize={{ minRows: 3, maxRows: 6 }}
          onChange={this.onChange}
        />
        <Button type="primary" size="large" onClick={() => this.onAppro('appro')}>同意</Button>
        <Button type="danger" size="large" onClick={() => this.onAppro('refuse')}>拒绝</Button>
      </Fragment>
    );
  }
}
