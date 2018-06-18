import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import _ from 'lodash';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import { Card, Row, Col, Button } from 'antd';
import Immutable from 'immutable';
import OrderForm from 'components/Order/OrderForm';
import { config } from 'utils';
import { savePaymentToStorage, removePaymentToStorage, newOrder } from '../../services/new';

const _pay = config.paymentFields;
const _vendor = config.settingFields.vendor;
const category = config.category;
const currency = config.currency;

export const formatPaymentFormValues = setting => params => {
  // 如果 setting vendor 和 params 不存在则返回
  if (!params || !setting.vendor) {
    return;
  }

  let { orderdetails, paytypeId, ...other } = params;

  // 如果details 不存在则创建一个
  if (!orderdetails) {
    let detail = {};
    detail[_pay.money] = other[_pay.amount];
    detail[_pay.paytypeId] = other[_pay.paytypeId];
    delete other[_pay.amount];
    orderdetails = Immutable.fromJS([detail]);
  }

  // 设置
  let detailBaseFields = {};

  // 循环找出vendor字段放入 detailBaseFields 中
  const buildBaseFields = objFields => {
    Object.keys(objFields).forEach(key => {
      let field = objFields[key];
      if (other[field] && field !== objFields.type) {
        detailBaseFields[field] = other[field];
        delete other[field];
      }
    });
  };
  buildBaseFields(_vendor);
  buildBaseFields(config.overseasFields);

  // 重设details
  orderdetails = orderdetails.map($detail => {
    // base数据 放入detail 中
    $detail = $detail.merge(detailBaseFields);

    // 找到正确的 paytypeId 和 paytypedetailId
    const paytypeList = Immutable.List.isList($detail.get(_pay.paytypeId)) ? $detail.get(_pay.paytypeId).toArray() : $detail.get(_pay.paytypeId);
    const hasCategory = !!category[paytypeList[0]]; // 是否包含目录名称

    if (Array.isArray(paytypeList)) {
      // 当pay type list 为数组时，最后两个是  paytypeId paytypedetailId
      if (
        (hasCategory && paytypeList.length > 2) ||
        (!hasCategory && paytypeList.length > 1)
      ) {
        $detail = $detail.set(_pay.paytypedetailId, _.nth(paytypeList, -1));
        $detail = $detail.set(_pay.paytypeId, _.nth(paytypeList, -2));
      } else {
        $detail = $detail.set(_pay.paytypeId, _.nth(paytypeList, -1));
      }
    } else {
      $detail = $detail.set(_pay.paytypeId, paytypeList);
    }

    // 如果没有银行名称
    if (!$detail.get(_pay.bankName)) { // 如果detail中没有 vendorName
      let bankName;
      let $vendor;

      // 在setting查找对应的vendor
      const vendorId = $detail.get('vendorId');
      if (vendorId) {
        $vendor = setting.vendor.find($item => $item.get('id') === vendorId);
      } else {
        const vendorName = $detail.get(_pay.vendorName);
        $vendor = setting.vendor.find($item => $item.get(_pay.vendorName) === vendorName);
      }

      // 在vendor detail 中查找bankName
      if ($vendor) {
        $vendor.get(_vendor.detail).forEach($vendorDetail => {
          if ($vendorDetail.get(_pay.bankNum) === $detail.get(_pay.bankNum)) {
            bankName = $vendorDetail.get(_pay.bankName);
            $detail = $detail.set(_pay.bankName, bankName);
            return false;
          }
        });
      }
    }
    return $detail;
  }).toJS();
  return { [_pay.currency]: currency.CNY, ...other, details: orderdetails }; // 默认货币为人民币
};


@connect((state) => ({
  $payment: state.new.$payment,
  setting: state.setting,
  pathname: state.routing.location.pathname,
}))
export default class New extends PureComponent {
  componentDidMount() {
    this.props.dispatch({ type: 'new/init' });
  }

  // 修改表单 将值自动保存到本地缓存中
  @Bind()
  @Debounce(1500)
  onValuesChange($payment) {
    const { pathname } = this.props;
    if (pathname.includes('/new')) {
      savePaymentToStorage($payment);
    }
  }

  onFieldsChange = (values) => {
    let $payment = this.props.$payment;
    const newValue = {};
    for (let key in values) {
      newValue[key] = values[key].value;
    }
    this.props.dispatch({
      type: 'new/onFieldsChange',
      payload: newValue,
    });
    this.onValuesChange($payment);
  };
  onSaveAndSubmit = () => this.create(true);
  getFormatFormValues = () => {
    let params;
    this.form.validateFields((err, values) => {
      if (!err) {
        params = formatPaymentFormValues(this.props.setting)(values);
      }
    });
    return params;
  };
  create = (isSubmit = false) => {
    const { dispatch } = this.props;
    const params = this.getFormatFormValues();
    if (params) {
      if (isSubmit) {
        params.isSubmit = isSubmit;
      }
      newOrder(params)
        .then((e) => {
          if (e.status === 'success') {
            removePaymentToStorage();
            const nextUrl = isSubmit ? '/my-list/process' : '/my-list/start';
            dispatch(routerRedux.push(nextUrl));
          }
        });
    }
  };

  render() {
    const { $payment } = this.props;
    return (
      <Fragment>
        <Card bordered={false}>
          <OrderForm
            isNew
            wrappedComponentRef={e => this.form = e && e.props.form}
            payment={$payment}
            onFieldsChange={this.onFieldsChange}
          />
        </Card>
        <Card bordered={false} style={{ marginTop: 16 }}>
          <Row type="flex" justify="space-between" style={{ width: '80%', marginLeft: 'auto', marginRight: 'auto' }}>
            <Col>
              <Button type="primary" size="large" onClick={this.onSaveAndSubmit}>提交审批</Button>
            </Col>
            <Col>
              <Button size="large" className="second-btn" onClick={() => this.create()}>保存</Button>
            </Col>
          </Row>
        </Card>
      </Fragment>
    );
  }
}
