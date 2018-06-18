import { stringify } from 'qs';
import request from '../utils/request';

export async function fetchReceipt(params) {
  return request(`/api/receipts?${stringify(params)}`);
}

export async function fetchReceiptDetail({ id, ...params }) {
  return request(`/api/receipts/${id}?${stringify(params)}`);
}

export async function createReceipt(params) {
  return request('/api/receipts', {
    method: 'POST',
    body: params,
  });
}

export async function updateReceipt({ id, ...params }) {
  return request(`/api/receipts/${id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function updateSubject({ id, ...params }) {
  return request(`/api/receipts/${id}/ordersubjects`, {
    method: 'PUT',
    body: params,
  });
}
