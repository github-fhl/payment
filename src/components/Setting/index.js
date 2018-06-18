import React from 'react';
import Immutable from 'immutable';
import { connect } from 'dva';
import { config, msg } from 'utils';
import { Cascader, Select } from 'antd';

const Option = Select.Option;

// Setting company
@connect(({ setting }) => ({
  data: setting.currency,
}))
export class CurrencySelect extends React.PureComponent {
  render() {
    const { data, ...props } = this.props;
    return (
      <Select {...props}>
        {data.map(value => <Option key={value.get('id')}>{value.get('name')}</Option>)}
      </Select>
    );
  }
}

// Setting company
@connect(({ setting }) => ({
  data: setting.company,
}))
export class CompanySelect extends React.PureComponent {
  render() {
    const { data, ...props } = this.props;
    return (
      <Select {...props}>
        {data.map(value => <Option key={value.get('id')}>{value.get('name')}</Option>)}
      </Select>
    );
  }
}

// vendor component
export class VendorDefaultSelect extends React.PureComponent {
  render() {
    let { data, filterAction, ...props } = this.props;
    // 数据是否需要筛选
    if (filterAction) {
      data = filterAction(data);
    }
    return (
      <Select
        dropdownMatchSelectWidth={false}
        showSearch
        notFoundContent=""
        {...props}
        onChange={e => props.onChange(e, data)}
      >
        {data.map(value => <Option key={value.get('name')}>{value.get('name')}</Option>)}
      </Select>
    );
  }
}

// Setting vendor
export const VendorSelect = connect(({ setting }) => ({
  data: setting.vendor,
}))(VendorDefaultSelect);


// 包含Setting user 属性的 vendor值的 Select
const userFilter = $data => $data.filter($v => $v.get('vendorType') === config.vendorType.user);
export const UserVendorSelect = connect(({ setting }) => ({
  data: setting.vendor,
  mode: 'combobox',
  filterAction: userFilter,
}))(VendorDefaultSelect);

// 包含Setting company 属性的 vendor值的 Select
const companyFilter = $data => $data.filter($v => $v.get('vendorType') === config.vendorType.company);
export const CompanyVendorSelect = connect(({ setting }) => ({
  data: setting.vendor,
  mode: 'combobox',
  filterAction: companyFilter,
}))(VendorDefaultSelect);


// 预设费用的Select
@connect(({ setting }) => ({
  data: setting.default,
}))
export class DefaultSelect extends React.PureComponent {
  render() {
    let { data, filterAction, showPublicCos, ...props } = this.props;
    if (!props.showPublicCost) {
      data = data.filter($d => $d.get('name') !== 'publicCost');
    }

    // 数据是否需要筛选
    if (filterAction) {
      data = filterAction(data);
    }
    return (
      <Select {...props} notFoundContent="" onChange={e => props.onChange(e, data)}>
        {data.map(value => <Option key={value.get('id')}>{value.get('name')}</Option>)}
      </Select>
    );
  }
}

// 包含付款类型的Select
@connect(({ setting }) => ({
  data: setting.type,
}))
export class TypeSelect extends React.PureComponent {
  render() {
    let { data, filterAction, ...props } = this.props;

    // 数据是否需要筛选
    if (filterAction) {
      data = filterAction(data);
    }
    return (
      <Select {...props} notFoundContent="" onChange={e => props.onChange(e, data)}>
        {data.map(value => <Option key={value.get('id')}>{value.get('id')}</Option>)}
      </Select>
    );
  }
}

// 包含付款类型的Select
@connect(({ setting }) => ({
  data: setting.account,
}))
export class AccountSelect extends React.PureComponent {
  static defaultProps = {
    keyRender: item => item.get('id'),
    valueRender: item => [item.get('name'), item.get('bankNum')].filter(e => e).join(' , '),
  };

  render() {
    let { data, filterAction, keyRender, valueRender, ...props } = this.props;

    // 数据是否需要筛选
    if (filterAction) {
      data = filterAction(data);
    }
    const optionList = data.map(v => (<Option key={keyRender(v)}>{valueRender(v)}</Option>));
    return (
      <Select showSearch {...props} notFoundContent="" onChange={e => props.onChange(e, data)}>
        {optionList}
      </Select>
    );
  }
}

// 包含付款类型的Select
const { category } = config;

@connect(({ setting }) => ({
  data: setting.type,
}))
export class TypeCascader extends React.PureComponent {
  render() {
    let { data, filterAction, showCategory, value, ...props } = this.props;
    const options = Object.keys(category).map(
      key => {
        return {
          value: category[key],
          label: msg.paytypeId[category[key]],
          children: data.filter($type => $type.get('category') === category[key])
            .map($type => ({ value: $type.get('id'), label: $type.get('id') })).toJS(),
        };
      },
    );


    // 如果value不是数组类型,则匹配并转换值
    if (typeof value === 'string') {
      const newValue = data.find($item => $item.get('id') === value);
      if (newValue) {
        value = [newValue.getIn(['category']), value];
      } else {
        value = [value];
      }
    } else if (Immutable.List.isList(value)) {
      value = value.toArray();
    }
    // 数据是否需要筛选
    if (filterAction) {
      data = filterAction(data);
    }
    return (
      <Cascader
        size={props.size}
        style={props.style}
        disabled={props.disabled}
        value={value}
        onChange={v => props.onChange(showCategory ? v : v[1])}
        expandTrigger="hover"
        options={options}
      />
    );
  }
}

// 包含付款类型的Select

@connect(({ setting }) => ({
  data: setting.type,
}))
export class TripleTypeCascader extends React.PureComponent {
  onFormChange = value => {
    const { onChange } = this.props;
    value = this.formatValue(value);
    onChange(value);
  };
  formatValue = value => {
    const { data } = this.props;
    // 如果value不是数组类型,则匹配并转换值
    if (typeof value === 'string') {
      const newValue = data.find($item => $item.get('id') === value);
      if (newValue) {
        value = [newValue.get('category'), value];
      } else {
        value = [value];
      }
    } else if (Immutable.List.isList(value)) {
      value = value.toArray();
    }
    return value;
  };

  render() {
    let { data, filterAction, showCategory, value, ...props } = this.props;
    const options = Object.keys(category).map(
      key => {
        return {
          value: category[key],
          label: msg.paytypeId[category[key]],
          children: data.filter($type => $type.get('category') === category[key])
            .map($type => {
              let item = ({ value: $type.get('id'), label: $type.get('id') });

              // 是否含有三级菜单
              const $detail = $type.get(config.paymentFields.paytypedetails);
              if ($detail && $detail.size > 0) {
                item.children = $detail.map($d => ({ value: $d.get('id'), label: $d.get('id') })).toArray();
              }
              return item;
            }).toJS(),
        };
      },
    );

    // 如果value不是数组类型,则匹配并转换值
    value = this.formatValue(value);

    // 数据是否需要筛选
    if (filterAction) {
      data = filterAction(data);
    }
    return (
      <Cascader
        size={props.size}
        style={props.style}
        disabled={props.disabled}
        value={value}
        onChange={this.onFormChange}
        expandTrigger="hover"
        options={options}
      />
    );
  }
}


// 根据值显示对应的类型
@connect(({ setting }) => ({
  data: setting.type,
}))
export class TypeValueToText extends React.PureComponent {
  render() {
    let { data, value, showCategory, ...props } = this.props;
    if (value) {
      // 如果是从本地导入的Immutable 则转成数组
      if (Immutable.List.isList(value)) {
        value = value.toArray();
      }
      value = value.slice();
      if (showCategory) {
        if (!category[value[0]]) {
          const newValue = data.find($item => $item.get('id') === value[0]);
          let categoryCode = newValue && newValue.get('category');
          value.unshift(categoryCode);
        }
        value[0] = msg.paytypeId[category[value[0]]];
      } else if (category[value[0]]) {
        value.shift();
      }
      const valueStr = Array.isArray(value) ? value.join(' / ') : value;
      return <span style={props.style}>{valueStr}</span>;
    }
    return null;
  }
}

// 根据值显示对应的 company
@connect(({ setting }) => ({
  data: setting.company,
}))
export class CompanyValueToText extends React.PureComponent {
  render() {
    let { data, value, ...props } = this.props;
    if (value) {
      const newValue = data.find($item => $item.get('id') === value);
      if (newValue) return <span style={props.style}>{newValue.get('name')}</span>;
    }
    return null;
  }
}

// 根据值显示对应的 company
@connect(({ setting }) => ({
  data: setting.account,
}))
export class AccountValueToText extends React.PureComponent {
  render() {
    let { data, value, ...props } = this.props;
    if (value) {
      const newValue = data.find($item => $item.get('id') === value);
      if (newValue) return <span style={props.style}>{newValue.get('name')}</span>;
    }
    return null;
  }
}


// 包含付款类型的Select
@connect(({ setting }) => ({
  data: setting.type,
}))
export class TypeDetailSelect extends React.PureComponent {
  render() {
    let { data, paytypeId, ...props } = this.props;
    let option = null;
    const newValue = data.find($item => $item.get('id') === paytypeId);
    if (newValue) {
      const $detail = data.get('paytypedetails');
      option = $detail.map(value => <Option key={value.get('id')}>{value.get('id')}</Option>);
    }
    return (
      <Select {...props} onChange={e => props.onChange(e, data)} notFoundContent="">
        {option}
      </Select>
    );
  }
}

