import { config } from 'utils';
import request from '../utils/request';
import { formatOrder } from '../models/detail';

const { paymentFields: _pay, vendorType } = config;

// 创建申请单
export async function newOrder(params) {
  params[_pay.vendorType] = params[_pay.vendorType] || vendorType.company;
  return request('/api/orders', {
    method: 'POST',
    body: params,
  });
}

// 更新申请单
export async function updateOrder({ id, ...params }) {
  params[_pay.vendorType] = params[_pay.vendorType] || vendorType.company;
  return request(`/api/orders/${id}`, {
    method: 'PUT',
    body: params,
  });
}


// 创建申请单
export async function newExpensesOrder(params) {
  return request('/api/expenses', {
    method: 'POST',
    body: params,
  });
}

// 创建申请单
export async function importPaymentOrder(params) {
  return request('/api/importOrderExcel', {
    method: 'POST',
    body: params,
  });
}

function JsonParse(json) {
  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    // console.log('e', e);
  }
  return parsed;
}

// 保存创建申请单的值到localStorage
export const savePaymentToStorage = obj => {
  localStorage.setItem('payment', JSON.stringify(obj));
};

export const copyPaymentToStorage = $payment => {
  // 移除payment id，付款日期，金额等信息
  if ($payment.get(_pay.detail)) {
    $payment = $payment.update(_pay.detail, $details => $details.map($d => $d.delete(_pay.payDate).delete(_pay.money).delete('id')));
  }
  savePaymentToStorage(formatOrder($payment.toJS()));
};
export const getPaymentFormStorage = () => JsonParse(localStorage.getItem('payment'));
export const removePaymentToStorage = () => localStorage.removeItem('payment');
