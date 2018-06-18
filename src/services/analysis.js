import request from '../utils/request';


// 员工报销统计
export async function analysisReimusers(params) {
  return request('/api/statistics/reimusers/', {
    method: 'POST',
    body: params,
  });
}

// 银行流水统计
export async function analysisBank(params) {
  return request('/api/statistics/banks/', {
    method: 'POST',
    body: params,
  });
}
