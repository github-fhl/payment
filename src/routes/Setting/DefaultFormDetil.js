import React from 'react';
import { connect } from 'dva';
import Immutable from 'immutable';
import { Row, Col, Input, DatePicker, Select } from 'antd';
import moment from 'moment';
import { VendorSelect } from 'components/Setting';
import { settingFields as _set } from '../../common/config';

const { MonthPicker } = DatePicker;
const Option = Select.Option;


// 金额细则
@connect(({ setting }) => ({
  vendor: setting.vendor,
}))
export default class PayeeForm extends React.PureComponent {
  static defaultProps = {
    value: Immutable.Map(),
    disabled: false,
  };
  onVendorName = (name) => {
    this.props.onChange(
      this.props.value
        .set('vendorName', name)
        .set('vendordetailId', this.getVendorDetail(name).getIn([0, 'id'])),
    );
  };
  getVendorDetail = name => {
    // 获取当前的vendor bankNum list 输出
    let $vendorDetail = Immutable.List();
    if (this.props.vendor) {
      const $vendor = this.props.vendor.find(v => v.get('name') === name);
      if ($vendor) {
        $vendorDetail = $vendor.get(_set.vendor.detail);
      }
    }
    return $vendorDetail;
  };

  render() {
    const { onChange, value, disabled } = this.props;
    const $vendorDetail = this.getVendorDetail(value.get('vendorName'));
    return (
      <Row gutter={8} type="flex">
        <Col style={{ width: 120 }}>
          <MonthPicker
            disabled={disabled}
            value={value.get('validDate') && moment(value.get('validDate'))}
            placeholder="生效日期"
            onChange={e =>
              onChange(value.set('validDate', e && e.format('YYYY-MM')))
            }
          />
        </Col>
        <Col style={{ width: 120 }}>
          <Input
            disabled={disabled}
            value={value.get('money')}
            placeholder="限额"
            onChange={e => onChange(value.set('money', e.target.value))}
          />
        </Col>
        <Col style={{ width: 240 }}>
          <VendorSelect
            disabled={disabled}
            value={value.get('vendorName')}
            placeholder="收款方"
            onChange={this.onVendorName}
          />
        </Col>
        <Col>
          <Select
            disabled={disabled || $vendorDetail === undefined || $vendorDetail.size < 2}
            style={{ width: 210 }}
            value={value.get('vendordetailId')}
            notFoundContent=""
            placeholder="账户"
            onChange={e => onChange(value.set('vendordetailId', e))}
          >
            {$vendorDetail.map($d => (
              <Option key={$d.get('id')}>{$d.get(_set.vendor.bankNum)}</Option>
            ))}
          </Select>
        </Col>
      </Row>
    );
  }
}
