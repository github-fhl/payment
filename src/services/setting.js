import { stringify } from 'qs';
import request from '../utils/request';

export async function all(params) {
  return request(`/api/setup/summary?${stringify(params)}`);
}

export async function type(params) {
  return request(`/api/paytypes?${stringify({ status: 1, ...params })}`);
}

export async function company(params) {
  return request(`/api/companys?${stringify({ status: 1, ...params })}`);
}

export async function vendor(params) {
  return request(`/api/vendors?${stringify({ status: 1, ...params })}`);
}

export async function account(params) {
  return request(`/api/subjects?${stringify({ status: 1, ...params })}`);
}

export async function defaults(params) {
  return request(`/api/reimusers?${stringify({ status: 1, ...params })}`);
}

export async function fetchDefaultDetails({ id, ...params }) {
  return request(`/api/reimusers/${id}?${stringify(params)}`);
}

export const postSetting = {
  async company(params) {
    return request('/api/companys', {
      method: 'POST',
      body: params,
    });
  },
  async vendor(params) {
    return request('/api/vendors', {
      method: 'POST',
      body: params,
    });
  },
  async account(params) {
    return request('/api/subjects', {
      method: 'POST',
      body: params,
    });
  },
  async type(params) {
    return request('/api/paytypes', {
      method: 'POST',
      body: params,
    });
  },
  async default(params) {
    return request('/api/reimusers', {
      method: 'POST',
      body: params,
    });
  },
  async defaultDetails(params) {
    return request('/api/reimuserdetails', {
      method: 'POST',
      body: params,
    });
  },
};
export const updateSetting = {
  async company({ id, ...params }) {
    return request(`/api/companys/${id}`, {
      method: 'PUT',
      body: params,
    });
  },
  async vendor({ id, ...params }) {
    return request(`/api/vendors/${id}`, {
      method: 'PUT',
      body: params,
    });
  },
  async account({ id, ...params }) {
    return request(`/api/subjects/${id}`, {
      method: 'PUT',
      body: params,
    });
  },
  async default({ id, ...params }) {
    return request(`/api/reimusers/${id}`, {
      method: 'PUT',
      body: params,
    });
  },
  async type({ id, ...params }) {
    return request(`/api/paytypes/${id}`, {
      method: 'PUT',
      body: params,
    });
  },
};
export const deleteSetting = {
  async company(id) {
    return request(`/api/companys/${id}`, {
      method: 'DELETE',
    });
  },
  async vendor(id) {
    return request(`/api/vendors/${id}`, {
      method: 'DELETE',
    });
  },
  async account(id) {
    return request(`/api/subjects/${id}`, {
      method: 'DELETE',
    });
  },
  async default(id) {
    return request(`/api/reimusers/${id}`, {
      method: 'DELETE',
    });
  },
  async type(id) {
    return request(`/api/paytypes/${id}`, {
      method: 'DELETE',
    });
  },
};
