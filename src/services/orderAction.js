import { stringify } from 'qs';
import request from '../utils/request';

export async function type(params) {
  return request(`/api/paytypes?${stringify({ status: 1, ...params })}`);
}

export async function getDefaultMoney({ id, ...params }) {
  return request(`/api/v2/reimusers/getRest?${stringify({ reimuserId: id, ...params })}`);
}
