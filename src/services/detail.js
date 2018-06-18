import { stringify } from 'qs';
import request from '../utils/request';

// 获取单条申请单
export async function fetchDetail({ id, ...params }) {
  return request(`/api/orders/${id}?${stringify(params)}`);
}


// 审批报销申请单
export async function approExpensesDetail({ id, roleAction = 'submit', ...params }) {
  return request(`/api/expenses/stateMachine/${roleAction}`, {
    method: 'PUT',
    body: params,
  });
}

// 审批单条申请单
export async function approDetail({ id, roleAction, suffix = 'orders', ...params }) {
  return request(`/api/${roleAction}/${suffix}`, {
    method: 'PUT',
    body: params,
  });
}

// 收到发票
export async function setInvoice(params) {
  return request('/api/orderInvoice', {
    method: 'PUT',
    body: params,
  });
}

// 收到申请单
export async function setReceiveOrder(params) {
  return request('/api/receiveOrderStatus', {
    method: 'PUT',
    body: params,
  });
}

// 付款前导出
export async function exportBeforePay(params) {
  return request('/api/cashierExport/orders', {
    method: 'PUT',
    body: params,
  });
}

// 出纳付款
export async function paid(params) {
  return request('/api/cashierPay/orders', {
    method: 'PUT',
    body: params,
  });
}

// 出纳付款成功
export async function paidSuccess(params) {
  return request('/api/cashierPaySucceed/orders', {
    method: 'PUT',
    body: params,
  });
}

// 出纳付款
export async function paidExpense(params) {
  return request('/api/expenses/stateMachine/cashierPay', {
    method: 'PUT',
    body: params,
  });
}

// 出纳付款成功
export async function paidSuccessExpense(params) {
  return request('/api/expenses/stateMachine/cashierPaySucceed', {
    method: 'PUT',
    body: params,
  });
}

// 付款退回后修改detail 信息
export async function updateVendor({ id, ...params }) {
  return request(`/api/applicantUpdateDetails/${id}`, {
    method: 'PUT',
    body: params,
  });
}

// 出纳付款退回
export async function finishReturn(params) {
  return request('/api/cashierPayFailed/orders', {
    method: 'PUT',
    body: params,
  });
}

// 付款序列号
export async function fetchPayNum(params) {
  return request(`/api/paidNo?${stringify(params)}`);
}

// 出纳修改付款金额
export async function finishSetAmount({ id, ...params }) {
  return request(`/api/amountCNY/orders/${id}`, {
    method: 'PUT',
    body: params,
  });
}

// 出纳修改付款日期
export async function finishSetDate(params) {
  return request('/api/paidDate', {
    method: 'PUT',
    body: params,
  });
}

// 付款后导出 银行信息
export async function exportAfterPay(params) {
  return request(`/api/download/bankInfo?${stringify(params)}`);
}

// 获取科目拆分
export async function fetchSubject(params) {
  return request(`/api/ordersubjects?${stringify(params)}`);
}

// 设置科目拆分
export async function setSubject(params) {
  return request('/api/ordersubjects', {
    method: 'POST',
    body: params,
  });
}

// 下载科目单
export async function downloadVoucher(params) {
  return request(`/api/download/paymentVoucher?${stringify(params)}`);
}

// 获取 vendorCode
export async function getVendorCode(params) {
  return request(`/api/vendorCodes?${stringify(params)}`);
}

// 确认 vendorCode
export async function checkVendorCode(params) {
  return request(`/api/checkVendorCode?${stringify(params)}`);
}

// 出纳修改付款日期
export async function abandonOrder({ id, ...params }) {
  return request(`/api/orders/${id}`, {
    method: 'DELETE',
    body: params,
  });
}
