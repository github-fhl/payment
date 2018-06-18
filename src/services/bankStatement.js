import { stringify } from 'qs';
import request from '../utils/request';

export async function fetchBankStatement(params) {
  return request(`/api/bankStatement?${stringify(params)}`);
}

export async function getVoucher(params) {
  return request(`/api/preVoucherInfo?${stringify(params)}`);
}

export async function fetchCommon(params) {
  return request(`/api/commonId?${stringify(params)}`);
}

export async function fetchRate(params) {
  return request(`/api/excRate?${stringify(params)}`);
}

export async function createRate(params) {
  return request('/api/excRate', {
    method: 'POST',
    body: params,
  });
}

export async function deleteBankStatement({ id, ...params }) {
  return request(`/api/bankStatement/${id}`, {
    method: 'DELETE',
    body: params,
  });
}

export async function fetchBankStatementDetail({ id, ...params }) {
  return request(`/api/bankStatement/${id}?${stringify(params)}`);
}

export async function createBankStatement(params) {
  return request('/api/bankStatement', {
    method: 'POST',
    body: params,
  });
}

export async function updateBankStatement({ id, ...params }) {
  return request(`/api/bankStatement/${id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function changeIndex(params) {
  return request('/api/changeIndex', {
    method: 'PUT',
    body: params,
  });
}

