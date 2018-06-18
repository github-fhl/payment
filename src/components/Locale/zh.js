import {
  chilPath,
  paymentFields as _pay,
  permissionsFields as _perDetail,
  rootPath as _root,
  approStatus as aps, category, operation, vendorType,
} from '../../common/config';

const _my = chilPath.mylist;
const _set = chilPath.setting;
const _sup = chilPath.supervisor;
const _per = chilPath.permissions;
const _cas = chilPath.cashier;
const _fin = chilPath.finance;
const _finA = chilPath.finance_approval;
const _casp = chilPath.cashierPay;
const language = {

  //  global
  input_require: '缺少{name}',
  input_placeholder: '输入{name}',
  select_placeholder: '请选择{name}',
  over_length: '超过最大字符数{name}',
  miss_full_fields: '请将信息填写完整',
  code: 'Code',
  locale: 'EN',
  search: '搜索',
  tip: '温馨提示',
  add: '增加',
  total: '合计',
  new: '创建',
  copy: '复制',
  save: '保存',
  edit: '编辑',
  delete: '删除',
  print: '打印',
  confirmDelete: '确认删除吗？',
  operate: '操作',
  selected: '已选择',
  item: '项',
  keyWord: '关键字：',
  selectBank: '选择银行：',
  modifyBankNum: '银行账号：',
  editManager: '编辑系统人员信息',
  fin_approval_all: '批量审批',
  uploadSuccess: '上传成功',
  uploadFailed: '上传失败，请重新上传',
  printFailed: '只能打印公司类型的发票',
  // message
  save_success: '保存成功',
  save_failed: '保存失败',
  signInfo: '签名信息',
  userInfo: '用户资料',
  subject_code: '科目代号',

  // Form
  upload_title: '点击上传',

  //  login
  login_alert: '请使用公司域账户登录',
  login_username: '用户名',
  login_password: '密码',
  login_login: '登录',

  // permissions
  selectedUser: '请选择审批管理员',
  admin: '超级管理员',
  maintainer: '系统管理员',
  cashier: '出纳管理员',
  manager: '主管人员',
  applicant: '申请人',
  chief: '财务总监',
  finance: '财务审核员',
  hr: '人事管理员',
  general: '普通员工',
  GL: '总账',
  InterCompany: '集团往来会计',
  exportPay: '导出',
  selExport: '选择已导出',
  payReturn: '付款退回',
  paid: '付款',
  cashierPay_Modal_title: '付款详情',
  payBankName: '付款银行：',
  selectedOne: '请选择至少一项',
  wrongPaidNo: '请填写正确的凭证号',
  month: '月份：',
  searchWarning: '请填写至少三个字符',
  searchPlaceholder: '请填写员工姓名',
  toExport: '请先导出该项',
  successExport: '已成功导出',
  payfailedToExport: '付款失败，请重新导出',
  modifyPayDetail: '修改银行信息',

  //  side
  side_myList: '我的清单',
  side_supervisor_approval: '主管审批',
  side_cashier_comfirm: '出纳审核',
  side_finance_approval: '财务审核',
  side_finance_approval_done: '财务批准',
  side_cashier_payment: '出纳付款',
  side_analysis: '报销分析',
  side_permissions: '权限管理',
  side_setting: '系统设置',

  // 审批状态
  [aps.toSubmit]: '待提交', // 已创建，待提交
  [aps.updatedByApplicant]: '申请人修改付款信息', // 申请人修改付款信息
  [aps.toApproByManager]: '待主管审批', // 已提交，待主管审批
  [aps.refusedByManager]: '主管退回，待提交', // 主管否决，待提交
  [aps.toApproByCashier]: '待出纳审核', // 主管已批准，待出纳审核
  [aps.refusedByCashier]: '出纳退回，待提交', // 出纳否决，待提交
  [aps.toApproByFinance]: '待财务审核', // 出纳已审核，待财务审核
  [aps.refusedByFinance]: '财务经理审核未通过', // 财务否决，待提交
  [aps.toApproByChief]: '待财务审批', // 财务已审核，待财务总监审批
  [aps.refusedByChief]: '财务总监审批未通过', // 财务总监否决，待提交
  [aps.toExportByCashier]: '财务审批通过', // 财务总监已审批，待出纳导出
  [aps.toPayByCashier]: '出纳已导出', // 出纳已导出，待出纳付款
  [aps.payFailed]: '出纳付款退回', // 出纳付款失败，待出纳导出
  [aps.paySucceed]: '付款成功', // 出纳付款成功
  [aps.abandoned]: '已废弃', // 已废弃

  //  payment
  paymentTitle: '申请单信息',
  payment_subjectId: '付款银行',
  payment_venderCode: 'Vender Code',
  [`payment_${_pay.id}`]: 'ID',
  [`payment_${_pay.paytypeId}`]: '类型',
  [`payment_${_pay.payDate}`]: '归属月份',
  [`payment_${_pay.description}`]: '描述',
  [`payment_${_pay.company}`]: '付款公司',
  [`payment_detail${_pay.company}`]: '归属公司',
  [`payment_${_pay.companyName}`]: '付款公司',
  [`payment_${_pay.currency}`]: '币种',
  [`payment_${_pay.money}`]: '金额',
  [`payment_${_pay.amount}`]: '总金额',
  [`payment_${_pay.vendorName}`]: '收款方',
  [`payment_${_pay.bankNum}`]: '银行账户',
  [`payment_${_pay.bankName}`]: '银行名称',
  [`payment_${_pay.contacter}`]: '联系人',
  [`payment_${_pay.telphone}`]: '电话',
  [`payment_${_pay.remark}`]: '备注',
  [`payment_${_pay.detail}`]: '金额细则',
  [`payment_${_pay.invoice}`]: '发票',
  [`payment_${_pay.print}`]: '打印状态',
  [`payment_${_pay.createdAt}`]: '创建日期',
  [`payment_${_pay.reimuserId}`]: '成本中心',
  [`payment_${_pay.reimuserName}`]: '成本中心',
  [`payment_${_pay.status}`]: '状态',
  [`payment_${_pay.operator}`]: '申请人',
  [`payment_${_pay.payNum}`]: '凭证号',
  [`payment_${_pay.receiveOrderStatus}`]: '收到实体订单',
  [`payment_${_pay.subjectStatus}`]: '凭证制单',
  [`payment_${_pay.voucherDate}`]: '凭证日期',
  payment_vendorCount: '收款方总计',
  payment_vendorOther: '其他收款方',
  payment_code: '公司代号',
  payment_vendorType: '收款方类别',
  payment_bankNum: '银行账号',
  payment_bankCode: '银行代号',
  payment_accountType: '账户类别',
  payment_paytypedetailId: '费用明细',
  payment_details_btn: '设置金额细则',
  payment_submit: '提交审批',
  payment_submit_success: '提交成功',
  payment_reinvoice: '收到发票',
  payment_reInvoiceSuccess: '已收到发票！',
  payment_receiveOrder: '收到实体申请单',
  payment_receiveOrderSuccess: '已收到实体申请单！',
  payment_approve: '同意',
  payment_reject: '拒绝',
  payment_save: '保存',
  payment_saveOk: '保存成功！',
  payment_amount: '总额',
  payment_subjectOrder: '财务科目',
  payment_setOrder: '设置财务科目',
  payment_debit: '借方：',
  payment_lender: '贷方：',
  payment_addOrderSubject: '添加科目',
  payment_subjectAmount: '科目名称',
  payment_subject: '科目：',
  payment_subjectMoney: '金额：',
  payment_editAmount: '修改金额',
  payment_des: '备注：',
  payment_print: '打印',
  payment_recall: '撤回',
  payment_abandon: '作废',
  payment_agree: '同意',
  payment_remark: '备注',
  payment_handle: '处理',
  payment_operate: '操作',
  payment_paid: '已付款',
  payment_modify: '修改付款信息',
  payment_return: '付款退回',
  payment_paidDate: '付款日期',
  payment_export: '导出',
  payment_view: '查看',
  payment_noReceived: '未收到', // 已收到发票及收到实体订单的提示文字
  payment_received: '已收到', // 已收到发票及收到实体订单的提示文字
  payment_noNeed: '不需要', // 已收到发票及收到实体订单的提示文字
  payment_missRemark: '请填写备注',
  payment_missDetailFields: '请将信息填写完整',
  payment_amountNotSame: '总金额与金额详情合计不一致',
  payment_detailHasRepeat: '有相同重复的内容，请检查',
  payment_remarkTip: '填写更新的备注，会更容易审批通过',
  payment_tip: '如果您还有没有该申请单相关的发票，请及时准备。',
  payment_toApproByCashier: '主管已通过审核，请打印页面并准备相关发票交由出纳审核。',
  payment_updateAndApproByCashier: '更新付款信息，并提交出纳重新付款',
  payment_cashierPayFailedTip: '您的付款已被出纳退回请修改付款信息，并提交出纳重新付款',
  payment_paidNo: '凭证号',
  // modal
  payment_successPayDate: '最近付款日期',
  payment_selectBankTitle: '请选择银行账号',
  payment_missSelectVendor: '请选择供应商',
  // 类型分类
  [category.employee]: '员工相关',
  [category.operatingCost]: '运营成本',
  // [category.others]: '其他',

  //  payment read
  paymentRead_content: '申请内容',
  paymentRead_info: '付款信息',
  // log
  [`log_${operation.create}`]: '创建',
  [`log_${operation.submit}`]: '提交',
  [`log_${operation.applicantUpdate}`]: '申请人更新付款信息',
  [`log_${operation.managerAppro}`]: '主管批准',
  [`log_${operation.managerRefuse}`]: '主管拒绝',
  [`log_${operation.cashierAppro}`]: '出纳批准',
  [`log_${operation.cashierRefuse}`]: '出纳拒绝',
  [`log_${operation.financeAppro}`]: '财务审核通过',
  [`log_${operation.financeRefuse}`]: '财务审核拒绝',
  [`log_${operation.chiefAppro}`]: '财务总监批准',
  [`log_${operation.chiefRefuse}`]: '财务总监拒绝',
  [`log_${operation.cashierExport}`]: '出纳导出',
  [`log_${operation.cashierExportAgain}`]: '出纳重新导出',
  [`log_${operation.cashierPayFailed}`]: '付款退回',
  [`log_${operation.cashierPaySucceed}`]: '付款完成',
  [`log_${operation.abandon}`]: '废弃',

  // 网站title
  title_new_payment: '创建申请单',

  // 我的清单
  [`${_root.mylist}_${_my.waiting}`]: '等待提交',
  [`${_root.mylist}_${_my.pending}`]: '正在审批',
  [`${_root.mylist}_${_my.finish}`]: '审批完成',

  // 权限管理
  [`${_root.permissions}_${_per.systemUser}`]: '系统用户',
  [`${_root.permissions}_${_per.supervisor}`]: '主管人员',
  [`${_root.permissions}_${_per.applicant}`]: '申请人',
  [`${_root.permissions}_${_per.financialAuditor}`]: '财务审核员',
  [`${_root.permissions}_${_per.financialAdministrator}`]: '财务总监',
  [`${_root.permissions}_${_per.cashierManager}`]: '出纳管理员',
  [`${_root.permissions}_${_per.systemAdministrator}`]: '系统管理员',
  [`${_root.permissions}_${_per.hrAccount}`]: '人事管理员',
  [`${_root.permissions}_${_per.gl}`]: '总账',
  [`${_root.permissions}_${_per.interCompany}`]: '集团往来会计',
  [`permissions_${_perDetail.id}`]: '用户名',
  [`permissions_${_perDetail.name}`]: '姓名',
  [`permissions_${_perDetail.department}`]: '部门',
  [`permissions_${_perDetail.position}`]: '职位',
  [`permissions_${_perDetail.email}`]: '邮箱',
  [`permissions_${_perDetail.telephoneNumber}`]: '分机号',
  [`permissions_${_perDetail.managerUsr}`]: '普通主管',
  [`permissions_${_perDetail.directorUsr}`]: '总监主管',
  [`permissions_${_perDetail.roles}`]: '权限',
  [`permissions_${_perDetail.signatures}`]: '签名',
  [`permissions_${_perDetail.cn}`]: '姓名',
  [`permissions_${_perDetail.title}`]: '职位',
  permissions_operate: '操作',

  // 系统设置
  [`setting_${_set.company}`]: '付款公司',
  [`setting_${_set.vendor}`]: '收款方',
  [`setting_${_set.account}`]: '科目管理',
  [`setting_${_set.default}`]: '预设费用',
  [`setting_${_set.type}`]: '付款类型',

  // 付款公司
  [`${_set.company}_name`]: '名称',
  [`${_set.company}_view`]: '查看',

  // 收款方
  [`${_set.vendor}_name`]: '名称',
  [`${_set.vendor}_vendorType`]: '收款方类别',
  [`${_set.vendor}_detail`]: '账户信息',
  [`${_set.vendor}_detail_tip`]: '请输入完整的账户信息',
  [`${_set.vendor}_addField`]: '添加账户',
  [`vendorType_${vendorType[0]}`]: '公司',
  [`vendorType_${vendorType[1]}`]: '个人',

  // 科目管理
  [`${_set.account}_name`]: '名称',
  [`${_set.account}_bankFlag`]: '银行科目',
  [`${_set.account}_description`]: '描述',

  // 付款类型
  [`${_set.type}_name`]: '名称',
  [`${_set.type}_description`]: '描述',
  [`${_set.type}_category`]: '类别',

  // 预设费用
  [`${_set.default}_name`]: '成本中心',
  [`${_set.default}_vendorName`]: '收款方',
  [`${_set.default}_vendordetailId`]: '账户',
  [`${_set.default}_bankNum`]: '账户',
  [`${_set.default}_bankName`]: '银行名称',
  [`${_set.default}_paytypeId`]: '类别',
  [`${_set.default}_money`]: '限额',
  [`${_set.default}_validDate`]: '生效日期',
  [`${_set.default}_current`]: '预设费用',
  [`${_set.default}_future`]: '计划预设费用',
  [`${_set.default}_history`]: '往期预设费用',
  [`${_set.default}_more`]: '查看更多',
  [`${_set.default}_hide`]: '收起更多',
  [`${_set.default}_editName`]: '更新',
  [`${_set.default}_editMoney`]: '编辑',
  [`${_set.default}_newName`]: '创建成本中心',
  [`${_set.default}_newMoney`]: '创建预设费用',

  // 主管审批页面 supervisor_approving

  [`${_root.supervisor}_${_sup.approving}`]: '待审批',
  [`${_root.supervisor}_${_sup.approved}`]: '已审批',
  [`${_root.supervisor}_agree`]: '同意',
  [`${_root.supervisor}_reject`]: '拒绝',

  // 出纳审批
  [`${_root.cashier}_${_cas.approving}`]: '待审批',
  [`${_root.cashier}_${_cas.approved}`]: '已审批',
  [`${_root.cashier}_agree`]: '同意',
  [`${_root.cashier}_reject`]: '拒绝',

  // 财务审核
  [`${_root.finance}_${_fin.approving}`]: '待审核',
  [`${_root.finance}_${_fin.approved}`]: '已审核',
  [`${_root.finance}_agree`]: '同意',
  [`${_root.finance}_reject`]: '拒绝',
  [`${_root.finance}_check`]: '审核',
  [`${_root.finance}_approval`]: '审批',

  // 财务审批

  [`${_root.finance_approval}_${_finA.approving}`]: '待审批',
  [`${_root.finance_approval}_${_finA.approved}`]: '已审批',
  [`${_root.finance_approval}_agree`]: '同意',
  [`${_root.finance_approval}_reject`]: '拒绝',

  // 出纳付款
  [`${_root.cashierPay}_${_casp.unpaid}`]: '待付款',
  [`${_root.cashierPay}_${_casp.paid}`]: '已付款',
  [`${_root.cashierPay}_agree`]: '同意',
  [`${_root.cashierPay}_reject`]: '拒绝',
  exportPayBank: '导出付款信息',

  // paytype
  paytype_id: 'id',
  paytype_description: '描述',
};

export default language;
