/* global window */
import _ from 'lodash';
import Immutable from 'immutable';
import * as config from './config';
import * as msg from './msg';
import request from './request';
import format from './format';
import columns from './columns';


// 下载指定链接
const downloadUrl = (url, name = _.nth(url.split('/'), -1)) => {
  let link = document.createElement('a');
  link.download = name;
  link.href = url;
  link.click();
};

// 获取 payTypeId 和 paytypedetailId
const getPayType = (paytypeList) => {
  paytypeList = Immutable.List.isList(paytypeList) ? paytypeList.toArray() : paytypeList;
  const hasCategory = !!config.category[paytypeList[0]]; // 是否包含目录名称
  let values = {};
  if (Array.isArray(paytypeList)) {
    // 当pay type list 为数组时，最后两个是  paytypeId paytypedetailId
    if (
      (hasCategory && paytypeList.length > 2) ||
      (!hasCategory && paytypeList.length > 1)
    ) {
      values.paytypedetailId = _.nth(paytypeList, -1);
      values.paytypeId = _.nth(paytypeList, -2);
    } else {
      values.paytypeId = _.nth(paytypeList, -1);
    }
  } else {
    values.paytypeId = paytypeList;
  }
  return values;
};


export {
  downloadUrl,
  getPayType,
  format,
  config,
  request,
  columns,
  msg,
};
