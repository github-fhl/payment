import { config } from 'utils';
import { isUrl } from '../utils/utils';

const menuData = [{
  name: '我的清单',
  icon: 'file-text',
  path: 'my-list',
  authority: [
    config.roles.applicant,
    config.roles.admin,
  ],
  children: [{
    name: '等待提交',
    path: 'start',
  }, {
    name: '正在审批',
    path: 'process',
  }, {
    name: '审批完成',
    path: 'end',
  }, {
    hideInMenu: true,
    name: '新建申请单',
    path: 'new',
  }],
}, {
  name: '主管审批',
  icon: 'file-unknown',
  path: 'supervisor',
  authority: [
    config.roles.manager,
    config.roles.admin,
  ],
  children: [{
    name: '待审批',
    path: 'start',
  }, {
    name: '已审批',
    path: 'end',
  }],
}, {
  name: '出纳审核',
  icon: 'inbox',
  path: 'cashier',
  authority: [
    config.roles.cashier,
    config.roles.admin,
  ],
  children: [{
    name: '待审批',
    path: 'start',
  }, {
    name: '已审批',
    path: 'end',
  }],
}, {
  name: '集团往来会计',
  icon: 'global',
  path: 'inter-company',
  authority: [
    config.roles.InterCompany,
    config.roles.admin,
  ],
  children: [{
    name: '待审批',
    path: 'start',
  }, {
    name: '已审批',
    path: 'end',
  }],
}, {
  name: '财务审核',
  icon: 'pay-circle-o',
  path: 'finance',
  children: [{
    name: '待审批',
    path: 'start',
    authority: [
      config.roles.finance,
      config.roles.admin,
    ],
  }, {
    name: '已审批',
    path: 'end',
    authority: [
      config.roles.finance,
      config.roles.admin,
      config.roles.InterCompany,
      config.roles.GL,
    ],
  }],
}, {
  name: '财务审批',
  icon: 'check-circle-o',
  path: 'chief',
  authority: [
    config.roles.chief,
    config.roles.admin,
  ],
  children: [{
    name: '待审批',
    path: 'start',
  }, {
    name: '已审批',
    path: 'end',
  }],
}, {
  name: '出纳付款',
  icon: 'red-envelope',
  path: 'paying',
  authority: [
    config.roles.cashier,
    config.roles.admin,
  ],
  children: [{
    name: '待审批',
    path: 'start',
  }, {
    name: '已审批',
    path: 'end',
  }],
}, {
  name: '出纳收款',
  icon: 'profile',
  path: 'receipt/start',
  authority: [
    config.roles.InterCompany,
    config.roles.GL,
    config.roles.cashier,
    config.roles.admin,
  ],
}, {
  name: '报表分析',
  icon: 'dot-chart',
  path: 'analysis',
  authority: [
    config.roles.chief,
    config.roles.admin,
  ],
  children: [{
    name: '员工报销统计',
    path: 'employee',
  }, {
    name: '银行流水统计',
    path: 'bank',
  }],
}, {
  name: '银行流水',
  icon: 'calculator',
  path: 'bank-statement',
  authority: [
    config.roles.InterCompany,
    config.roles.GL,
    config.roles.cashier,
    config.roles.admin,
  ],
}, {
  name: '凭证号',
  icon: 'profile',
  path: 'voucher',
  authority: [
    config.roles.cashier,
    config.roles.admin,
  ],
  children: [{
    name: '付款凭证',
    path: 'start',
  }, {
    name: '收款凭证',
    path: 'end',
  }],
}, {
  name: '权限管理',
  icon: 'team',
  path: 'permission',
  authority: [
    config.roles.maintainer,
    config.roles.admin,
  ],
}, {
  name: '系统设置',
  icon: 'setting',
  path: 'setting',
  authority: [
    config.roles.finance,
    config.roles.chief,
    config.roles.maintainer,
    config.roles.hr,
    config.roles.admin,
  ],
  children: [{
    name: '付款公司',
    path: 'company',
  }, {
    name: '收款方',
    path: 'vendor',
  }, {
    name: '科目管理',
    path: 'account',
  }, {
    name: '预设费用',
    path: 'default',
  }, {
    name: '付款类型',
    path: 'type',
  }],
}, {
  name: '异常页',
  icon: 'warning',
  path: 'exception',
  hideInMenu: true,
  children: [{
    name: '403',
    path: '403',
  }, {
    name: '404',
    path: '404',
  }, {
    name: '500',
    path: '500',
  }, {
    name: '触发异常',
    path: 'trigger',
    hideInMenu: true,
  }],
}, {
  name: '账户',
  icon: 'user',
  path: 'user',
  authority: 'guest',
  children: [{
    name: '登录',
    path: 'login',
  }],
}];

function formatter(data, parentPath = '/', parentAuthority) {
  return data.map((item) => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
