export const sentCodeInterval = 59 * 1000; // 发送验证码的间隔

export const tdDefaultWidth = 100; // 表格默认宽度

// 收款方性质
export const vendorType = {
  company: 'company',
  user: 'user',
};

// 费用类型
export const voucherCosttype = {
  inouse: 'inouse',
  Production: 'Production',
};
// 交易类型
export const voucherTransactiontype = {
  pay: '付款',
  collection: '收款',
};

// 申请单性质
export const orderType = {
  Payment: 'Payment',
  Expense: 'Expense',
  OverseasPayment: 'OverseasPayment',
};

// 特殊的预设费用
export const specialDefault = {
  publicCost: 'publicCost',
  others: 'others',
};

// 货币
export const currency = {
  CNY: 'CNY', // 人民币
  USD: 'USD', // 美元
};

// 银行代号
export const bankCode = [
  'SWIFT BIC', 'Australia-BSB Cod', 'Canada- Routing Nu', 'China-CNAPS', 'Germany-Bankleitz', 'Hong Kong-Bank C', 'Singapore-Bank Co', 'United Kingdom-Sort Code', 'United States-Fedwi', 'United States-CHIPS',
];

// role的类型
export const roles = {
  guest: 'guest', // '游客只能有登录页面的权限'
  admin: 'admin', // '管理员'
  hr: 'hr', // '人事'
  cashier: 'cashier', // '出纳'
  GL: 'GL', // '总账'
  InterCompany: 'InterCompany', // '集团往来会计'
  finance: 'finance', // '财务'
  chief: 'chief', // '财务总监'
  general: 'general', // '普通员工'
  applicant: 'applicant', // '申请人'
  maintainer: 'maintainer', // '维护人员'
  manager: 'manager', // '主管'
};

// role的默认首页
export const rolesRoot = {
  admin: '/my-list', // '管理员'
  hr: '/setting/company', // '人事'
  cashier: '/cashier', // '出纳'
  GL: '/finance/end', // '总账'
  InterCompany: '/finance/end', // '集团往来会计'
  finance: '/finance', // '财务'
  chief: '/chief', // '财务总监'
  applicant: '/my-list', // '申请人'
  maintainer: '/permissions/systemUser', // '维护人员'
  manager: '/supervisor', // '主管'
};


// 当前审批状态
export const approStatus = {
  toSubmit: 'toSubmit', // 已创建，待提交
  toApproByManager: 'toApproByManager', // 已提交，待主管审批

  refusedByManager: 'refusedByManager', // 主管否决，待提交
  toApproByCashier: 'toApproByCashier', // 主管已批准，待出纳审核

  refusedByCashier: 'refusedByCashier', // 出纳否决，待提交

  refusedByIC: 'refusedByIC', // Inter Company 已拒绝（境外付款）
  toApproByIC: 'toApproByIC', // 出纳已审核，待 Inter Company 审核（境外付款）

  toApproByFinance: 'toApproByFinance', // 出纳 / Inter Company 已审核，待财务审核

  refusedByFinance: 'refusedByFinance', // 财务经理否决，待提交
  toApproByChief: 'toApproByChief', // 财务经理已审核，待财务总监审批

  refusedByChief: 'refusedByChief', // 财务总监否决，待提交
  toPayByCashier: 'toPayByCashier', // 财务总监已审批，待出纳付款 (旧：出纳已导出，待出纳付款)

  toConfirmSucceed: 'toConfirmSucceed', // 出纳付款，待确认付款成功

  paySucceed: 'paySucceed', // 出纳付款成功
  payFailed: 'payFailed', // 出纳付款失败，待出纳导出（申请人修改信息）

  updatedByApplicant: 'updatedByApplicant', // 申请人已修改信息，待确认付款成功

  abandoned: 'abandoned', // 已废弃
};

// payment 表单字段
export const listFields = {
  id: 'id',
  paytypeId: 'paytypeId', // 类型
  vendorName: 'vendorName', // 收款方
  amount: 'amount', // 总额
  description: 'description', // 描述
  createdAt: 'createdAt', // 创建日期
  approStatus: 'approStatus', // 状态
  invoiceStatus: 'invoiceStatus', // 发票
  printStatus: 'printStatus', // 打印
  receiveOrderStatus: 'receiveOrderStatus', // 实体订单
  exportStatus: 'exportStatus', // 导出状态
  subjectStatus: 'subjectStatus', // 凭证制单
  currency: 'currency', // 凭证制单
  paidNo: 'paidNo', // 凭证制单号
  bankName: 'bankName', // 付款银行名称
};

// 报销类型的类别
export const category = {
  employee: 'employee', // 员工类别
  operatingCost: 'operatingCost', // 办公室类别
  // others:'others'  //其它类别
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

export const overseasFields = {
  vendorAddress: 'vendorAddress',
  bankAddress: 'bankAddress',
  bankCodeType: 'bankCodeType',
  bankCode: 'bankCode',
  country: 'country',
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

// 银行流水中的 type 字段
export const transactionType = {
  Receipt: 'Receipt',
  Payment: 'Payment',
};
// 银行流水中的 costType 字段
export const costType = {
  Inhouse: 'Inhouse',
  Production: 'Production',
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
  vendorName: 'vendorName',
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
  ...overseasFields,
};
