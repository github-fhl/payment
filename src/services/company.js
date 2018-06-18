import request from '../utils/request';

export async function fetchCompanyProfile() {
  return request('/api/c/companys/company');
}
