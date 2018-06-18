import { stringify } from 'qs';
import request from '../utils/request';

export async function queryCurrent() {
  return request('/api/userinfo');
}

export async function getLog({ id, ...params }) {
  return request(`/api/applylogs/${id}?${stringify({ status: 1, ...params })}`);
}

export async function login(params) {
  return request('/api/login', {
    method: 'PUT',
    body: params,
  });
}

export async function logout() {
  return request('/api/logout', {
    method: 'PUT',
  });
}
