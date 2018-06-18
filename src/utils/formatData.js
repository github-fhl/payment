/*
* 用于系统设置，后期优化掉
* */
import Immutable from 'immutable';
import { paymentFields as _pay, settingFields, currency, category } from '../common/config';

const _vendor = settingFields.vendor;


// num toFixed
export const toFixed = (num, fractionDigits = 2) => (Math.round(num * (10 ** fractionDigits)) / (10 ** fractionDigits)).toFixed(fractionDigits);

// 货币格式化
export const numberWithCommas = (x) => {
  x = x === undefined ? 0 : x;
  let parts = x.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

// 格式化 货币的显示方式
export const formatMoney = m => numberWithCommas(toFixed(m));

// 格式化数据库时间
export const formatDate = e => e.replace(/(\d{4}-\d{2}-\d{2}).*/, '$1');

// 格式化 payment post数据
export const formatPaymentFormValues = $setting => params => {
  // 如果 setting vendor 和 params 不存在则返回
  if (!params || !$setting.get('vendor')) {
    return;
  }

  let { details, paytypeId, ...other } = params;

  // 如果details 不存在则创建一个
  if (!details) {
    let detail = {};
    detail[_pay.money] = other[_pay.amount];
    delete other[_pay.amount];
    details = Immutable.fromJS([detail]);
  }

  // 设置
  let detailBaseFields = {};

  // 循环找出vendor字段放入 detailBaseFields 中
  Object.keys(_vendor).forEach(key => {
    let field = _vendor[key];
    if (field in other && field !== _vendor.type) {
      detailBaseFields[field] = other[field];
      delete other[field];
    }
  });

  // 重设details
  details = details.map($detail => {
    // base数据 放入detail 中
    $detail = $detail.merge(detailBaseFields);

    // 找到正确的 paytypeId和paytypedetailId
    const paytypeIdList = Immutable.List.isList($detail.get(_pay.paytypeId)) ? $detail.get(_pay.paytypeId).toArray() : $detail.get(_pay.paytypeId);
    const categoryCount = category[paytypeIdList[0]] ? 1 : 0;
    $detail = $detail.set(_pay.paytypeId, paytypeIdList[0 + categoryCount]);
    if (paytypeIdList.length > 1 + categoryCount) {
      $detail = $detail.set(_pay.paytypedetailId, paytypeIdList[1 + categoryCount]);
    }

    // 如果没有银行名称
    if (!$detail.get(_pay.bankName)) { // 如果detail中没有 vendorName
      let bankName;
      let $vendor;

      // 在setting查找对应的vendor
      if ($detail.get('vendorId')) {
        $vendor = $setting.getIn(['vendor', $detail.get('vendorId')]);
      } else {
        $setting.get('vendor').toList().forEach($v => {
          if ($detail.get(_pay.vendorName) === $v.get(_pay.vendorName)) {
            $vendor = $v;
            return false;
          }
        });
      }

      // 在vendor detail 中查找bankName
      $vendor.get(_vendor.detail).forEach($vendorDetail => {
        if ($vendorDetail.get(_pay.bankNum) === $detail.get(_pay.bankNum)) {
          bankName = $vendorDetail.get(_pay.bankName);
          $detail = $detail.set(_pay.bankName, bankName);
          return false;
        }
      });
    }

    return $detail;
  }).toJS();
  return { ...other, details, [_pay.currency]: currency.CNY }; // 默认货币为人民币
};


// 格式化 order 数据
export const formatOrder = data => {
  // 提升 companyName
  data.companyName = data.company && data.company.name;
  data.companyCode = data.company && data.company.code;
  delete data.company;

  // 提升 details
  if (Array.isArray(data.orderdetails)) {
    data.details = data.orderdetails.map((detail, index) => {
      // 提升 paytypeId  paytypeCategory
      if (index === 0) {
        data.paytypeId = [detail.paytypeId];
        if (detail[_pay.paytypedetailId]) { // paytype 有三个级菜单时
          data.paytypeId.push(detail[_pay.paytypedetailId]);
        }
        data.paytypeCategory = detail.paytype && detail.paytype.category;
      }
      detail.paytypeId = [detail.paytypeId];
      if (detail[_pay.paytypedetailId]) {
        detail.paytypeId.push(detail[_pay.paytypedetailId]);
      }
      delete detail.paytype;

      // 提升 vendorName
      detail.vendorName = detail.vendor && detail.vendor.name;
      detail.vendorCode = detail.vendor && detail.vendor.code;
      delete detail.vendor;

      // 提升 reimuserName
      detail.reimuserName = detail.reimuser && detail.reimuser.name;
      delete detail.reimuser;

      return detail;
    });
    delete data.orderdetails;
  }
  return data;
};

// 将分散在details 数据抽出和并成一条数据
export function splitDataFromField(field) {
  return function splitData(data = Immutable.List()) {
    let $formatVendor = Immutable.List();
    data.forEach($v => {
      const $base = $v.delete(field);
      const $details = $v.get(field);
      if ($details.size > 0) {
        const $list = $details.map(($detail) => $detail.merge($base));
        $formatVendor = $formatVendor.concat($list);
      } else {
        $formatVendor = $formatVendor.concat([$base]);
      }
    });
    return $formatVendor;
  };
}

export const formatDetails = (field = 'details') => splitDataFromField(field);


// Vendor  detail name 拿出来放入detail 中
export const formatVendor = data => {
  let resetData = data.vendors.map(venodr => ({
    ...venodr,
    vendordetails: venodr.vendordetails.map(detail => {
      const { vendor = {}, ...other } = detail;
      other.vendorName = vendor.name;
      return other;
    }),
  }));
  return resetData;
};


// Default  付款对象的detail 数据格式化
export const formatDefaultDetail = data => {
  let value = data.reimuser;
  const mergeDetail = detail => {
    let newDetail;
    if (detail.length >= 1) {
      // 合并vendor 相关的信息并输出；
      const { vendordetail = {}, ...otherDetail } = detail[0];
      const { vendor, ...otherVendor } = vendordetail;
      newDetail = { ...otherDetail, ...otherVendor, vendorName: vendor.name };
    }
    return newDetail;
  };
  value.future = mergeDetail(value.future);
  value.current = mergeDetail(value.current);
  return value;
};
