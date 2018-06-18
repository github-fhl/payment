/**
 *
 * 后台数据配置
 *
 * */
export const y = 'y';
export const n = 'n';

export const signaturePath = '/public/signatures/';
export const logoPath = '/public/logos/';

// 报销类型的类别
export const category = {
  employee: 'employee', // 员工类别
  operatingCost: 'operatingCost', // 办公室类别
  // others:'others'  //其它类别
};

// 收款人类别
export const payeeType = {
  vendor: 'vendor', // 供应商
  reimuser: 'reimuser', // 报销人
};

// 申请单待操作角色类别
export const approType = {
  byAccount: 'byAccount', // 被用户审批
  byRole: 'byRole', // 被角色审批
};

// 货币
export const currency = {
  CNY: 'CNY', // 人民币
  USD: 'USD', // 美元
};

// 当前审批状态
export const approStatus = {
  toSubmit: 'toSubmit', // 已创建，待提交
  updatedByApplicant: 'updatedByApplicant', // 申请人修改付款信息
  toApproByManager: 'toApproByManager', // 已提交，待主管审批
  refusedByManager: 'refusedByManager', // 主管否决，待提交
  toApproByCashier: 'toApproByCashier', // 主管已批准，待出纳审核
  refusedByCashier: 'refusedByCashier', // 出纳否决，待提交
  toApproByFinance: 'toApproByFinance', // 出纳已审核，待财务审核
  refusedByFinance: 'refusedByFinance', // 财务否决，待提交
  toApproByChief: 'toApproByChief', // 财务已审核，待财务总监审批
  refusedByChief: 'refusedByChief', // 财务总监否决，待提交
  toExportByCashier: 'toExportByCashier', // 财务总监已审批，待出纳导出
  toPayByCashier: 'toPayByCashier', // 出纳已导出，待出纳付款
  payFailed: 'payFailed', // 出纳付款失败，待出纳导出
  paySucceed: 'paySucceed', // 出纳付款成功
  abandoned: 'abandoned', // 已废弃
};

// 待提交的状态
export const toApply = [
  'toSubmit',
  'refusedByManager',
  'refusedByCashier',
  'refusedByFinance',
  'refusedByChief',
];
export const applying = [
  'toApproByManager',
  'toApproByCashier',
  'toApproByFinance',
  'toApproByChief',
  'toExportByCashier',
  'toExportByCashier',
  'toPayByCashier',
  'payFailed',
];
export const applyed = ['paySucceed', 'abandoned'];

// 对申请单的操作
export const operation = {
  create: 'create', // 创建
  submit: 'submit', // 提交
  applicantUpdate: 'applicantUpdate', // 申请人更新信息
  managerAppro: 'managerAppro', // 主管批准
  managerRefuse: 'managerRefuse', // 主管拒绝
  cashierAppro: 'cashierAppro', // 出纳批准
  cashierRefuse: 'cashierRefuse', // 出纳拒绝
  financeAppro: 'financeAppro', // 财务批准
  financeRefuse: 'financeRefuse', // 财务拒绝
  chiefAppro: 'chiefAppro', // 总监批准
  chiefRefuse: 'chiefRefuse', // 总监拒绝
  cashierExport: 'cashierExport', // 出纳导出
  cashierExportAgain: 'cashierExportAgain', // 出纳重新导出
  cashierPayFailed: 'cashierPayFailed', // 出纳付款失败
  cashierPaySucceed: 'cashierPaySucceed', // 出纳付款成功
  abandon: 'abandon', // 废弃
};

/**
 *
 * 后台数据配置结束
 *
 * */

export const invoiceStatus = {
  y: 'y',
  n: 'n',
  noNeed: 'noNeed',
};

// 成本中心
export const settingDefault = {
  publicCost: 'publicCost',
};

// 收款方性质
export const vendorType = ['company', 'user'];

// 银卡科目
export const accountType = [
  {
    value: 'y',
    title: 'y',
  },
  {
    value: 'n',
    title: 'n',
  },
];

export const host = '/api';
export const serverurl = '/api';

// 网站路径
export const rootPath = {
  mylist: 'my-list',
  supervisor: 'supervisor',
  cashier: 'cashier',
  finance: 'finance',
  finance_approval: 'finance_approval',
  cashierPay: 'cashierPay',
  setting: 'setting',
  permissions: 'permissions',
};

export const chilPath = {
  mylist: {
    waiting: 'waiting',
    pending: 'pending',
    finish: 'finish',
  },
  supervisor: {
    approving: 'approving',
    approved: 'approved',
  },
  cashier: {
    approving: 'approving',
    approved: 'approved',
  },
  finance: {
    approving: 'approving',
    approved: 'approved',
  },
  finance_approval: {
    approving: 'approving',
    approved: 'approved',
  },
  cashierPay: {
    unpaid: 'unpaid',
    paid: 'paid',
  },
  setting: {
    company: 'company',
    vendor: 'vendor',
    account: 'account',
    default: 'default',
    type: 'type',
  },
  permissions: {
    systemUser: 'systemUser',
    applicant: 'applicant',
    supervisor: 'supervisor',
    financialAuditor: 'financialAuditor',
    financialAdministrator: 'financialAdministrator',
    cashierManager: 'cashierManager',
    systemAdministrator: 'systemAdministrator',
    hrAccount: 'hrAccount',
    gl: 'gl',
    interCompany: 'interCompany',
  },
};

// fetch state
export const fetchState = {
  success: 'success',
};

// 系统设置字段
export const settingFields = {
  vendor: {
    name: 'vendorName',
    bankNum: 'bankNum',
    bankName: 'bankName',
    contacter: 'contacter',
    telphone: 'telphone',
    lastPayDate: 'lastPayDate',
    type: 'vendorType',
    detail: 'vendordetails',
  },
};
// 凭证字段
export const voucherFields = {
  /*  凭证号、凭证日期、银行账号、金额、备注  */
  voucherId: 'voucherId',
  voucherDate: 'voucherDate',
  bankAccount: 'bankAccount',
  amount: 'amount',
  node: 'node',
};

//  申请单字段
export const paymentFields = {
  company: 'companyId',
  companyName: 'companyName',
  currency: 'currency',
  description: 'description',
  remark: 'remark',
  status: 'approStatus',
  id: 'id',
  createdAt: 'createdAt',
  invoice: 'invoiceStatus',
  print: 'printStatus',
  voucherDate: 'voucherDate',

  //  detail
  detail: 'orderdetails',
  orderId: 'orderId',
  amount: 'amount',
  money: 'money',
  payDate: 'payDate',
  bankNum: settingFields.vendor.bankNum,
  bankName: settingFields.vendor.bankName,
  paytypeId: 'paytypeId',
  reimuserId: 'reimuserId',
  reimuserName: 'reimuserName',
  vendor: 'vendor',
  vendorName: settingFields.vendor.name,
  payeeType: 'payeeType',
  contacter: settingFields.vendor.contacter,
  telphone: settingFields.vendor.telphone,
  operator: 'operator',
  vendorType: 'vendorType',
  payNum: 'payNum',
  receiveOrderStatus: 'receiveOrderStatus',
  subjectStatus: 'subjectStatus',
  paytypedetailId: 'paytypedetailId',
  paytypedetails: 'paytypedetails',
  paidDate: 'paidDate',
  paidNo: 'paidNo',
  subjectId: 'subjectId',
};

// 字段默认宽度
export const fieldsWith = {
  description: 200,
};

// payments 数据结构
export const $payments = {
  category: ['paytypeCategory'],
  [paymentFields.paytypeId]: [paymentFields.paytypeId],
  [paymentFields.operator]: ['applylogs', 0, paymentFields.operator],
  [paymentFields.vendorName]: ['details', 0, 'vendorName'],
  [paymentFields.bankName]: ['orderdetails', 0, 'bankName'],
  [paymentFields.bankNum]: ['orderdetails', 0, 'bankNum'],
  [paymentFields.contacter]: ['orderdetails', 0, 'contacter'],
  [paymentFields.telphone]: ['orderdetails', 0, 'telphone'],
  [paymentFields.status]: 'approStatus',
};

// modal props
export const modal = {
  maskClosable: false,
};

export const locale = {
  cn: 'zh',
  en: 'en',
};
export const formPathname = ['new', 'pending'];

export const paymentRefusedStatus = [
  approStatus.refusedByCashier,
  approStatus.refusedByChief,
  approStatus.refusedByFinance,
  approStatus.refusedByManager,
];

// payment form status
export const paymentFormStatus = [
  approStatus.toSubmit,
  ...paymentRefusedStatus,
];

// 权限菜单

export const permissionsFields = {
  id: 'id',
  name: 'name',
  department: 'department',
  position: 'position',
  email: 'mail',
  telephoneNumber: 'telephoneNumber',
  managerUsr: 'managerUsr',
  directorUsr: 'directorUsr',
  roles: 'roles',
  signatures: 'signatures',
  title: 'title',
  cn: 'cn',
};

// 银行前缀

export const bankPrefix = {
  // '222a73a0-06da-11e7-b23d-513f39f5849c':'BOC', //中国银行
  // 'a5bfcc00-2b14-11e7-a0d2-fb2bb80f61b1':'ICBC',
  中国银行: '222a73a0-06da-11e7-b23d-513f39f5849c',
  工商银行: 'a5bfcc00-2b14-11e7-a0d2-fb2bb80f61b1',
};
