import { stringify } from 'qs';
import request from '../utils/request';

export async function fetchVoucher(params) {
  return request(`/api/voucher?${stringify(params)}`);
}

export async function createVoucher(params) {
  return request('/api/voucher', {
    method: 'POST',
    body: params,
  });
}

export async function updateVoucher({ id, ...params }) {
  return request(`/api/voucher/${id}`, {
    method: 'PUT',
    body: params,
  });
}
export async function fetchVoucherDetail({ id, ...params }) {
  return request(`/api/voucher/${id}?${stringify(params)}`);
}
