export const paytypeId = {
  employee: '员工相关',
  operatingCost: '运营成本',
};
export const vendorType = {
  company: '公司',
  user: '个人',
};
export const approStatus = {
  toSubmit: '待提交', // 已创建，待提交
  updatedByApplicant: '申请人已修改付款信息', // 申请人修改付款信息
  toApproByManager: '待主管审批', // 已提交，待主管审批
  refusedByManager: '主管退回，待提交', // 主管否决，待提交
  refusedByIC: '集团往来会计已拒绝', // Inter Company 已拒绝（境外付款）
  toApproByIC: '待集团往来会计审核', // 出纳已审核，待 Inter Company 审核（境外付款）
  toApproByCashier: '待出纳审核', // 主管已批准，待出纳审核
  refusedByCashier: '出纳退回，待提交', // 出纳否决，待提交
  toApproByFinance: '待财务审核', // 出纳已审核，待财务审核
  refusedByFinance: '财务经理审核未通过', // 财务否决，待提交
  toApproByChief: '待财务审批', // 财务已审核，待财务总监审批
  refusedByChief: '财务总监审批未通过', // 财务总监否决，待提交
  toExportByCashier: '财务审批通过', // 财务总监已审批，待出纳导出
  toPayByCashier: '待出纳付款', // 待出纳付款
  payFailed: '出纳付款退回', // 出纳付款失败，待出纳导出
  paySucceed: '付款成功', // 出纳付款成功
  toConfirmSucceed: '待确认付款', // 待确认付款
  abandoned: '已废弃', // 已废弃
};

// role的类型
export const roles = {
  guest: '游客', // '游客只能有登录页面的权限'
  admin: '管理员', // '管理员'
  hr: '人事管理员', // '人事'
  cashier: '出纳管理员', // '出纳'
  GL: '总账会计', // '总账'
  InterCompany: '集团往来会计', // '集团往来会计'
  finance: '财务', // '财务'
  chief: '财务总监', // '财务总监'
  general: '普通员工', // '普通员工'
  applicant: '申请人', // '申请人'
  maintainer: '维护人员', // '维护人员'
  manager: '主管', // '主管'
};

export const permissionField = {
  name: '姓名',
  department: '部门',
  telephoneNumber: '分机号',
};

export const operateRoles = {
  applicant: '申请人',
  manager: '主管人员',
  cashier: '出纳管理员',
  GL: '总账',
  InterCompany: '集团往来会计',
  finance: '财务审核员',
  hr: '人事管理员',
  chief: '财务总监',
  maintainer: '系统管理员',
};
