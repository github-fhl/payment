import { stringify } from 'qs';
import request from '../utils/request';

// fetch 用户列表
export async function fetchPermission(params) {
  return request(`/api/accounts?${stringify({ status: 1, ...params })}`);
}

// 获取集团系统用户
export async function fetchSystemUser(params) {
  return request(`/api/ldaps?${stringify(params)}`);
}


// 创建签名
export async function updateSignatures(params) {
  return request('/api/signatures', {
    method: 'POST',
    body: params,
  });
}

// 创建用户
export async function createUser(params) {
  return request('/api/accounts', {
    method: 'POST',
    body: params,
  });
}

// 更新用户信息
export const updateUserInfo = ({ id, ...params }) => {
  return request(`/api/accounts/${id}`, {
    method: 'PUT',
    body: params,
  });
};

// 更新用户权限
export async function updateUserRoles(params) {
  return request('/api/accountroles', {
    method: 'POST',
    body: params,
  });
}

// 删除一个用户列表
export async function deleteUser(params) {
  return request('/api/accounts', {
    method: 'DELETE',
    body: params,
  });
}
