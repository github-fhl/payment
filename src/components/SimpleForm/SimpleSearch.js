import React from 'react';
import { DatePicker, Button, Select, Input } from 'antd';
import moment from 'moment';
import { AccountSelect } from 'components/Setting';
import { msg } from 'utils';
import {
  paymentFields as _pay,
  approStatus,
  invoiceStatus,
} from '../../common/config';
import SimpleForm from './SimpleForm';
import './SimpleSearch.less';

// 状态筛选组件
const Option = Select.Option;
const statusData = [
  approStatus.refusedByChief,
  approStatus.toExportByCashier,
  approStatus.toPayByCashier,
  approStatus.payFailed,
  approStatus.paySucceed,
];

// 时间选择组件
const dataStyle = { width: 110, margin: '0 5px' };
const DataRange = ({ value = [], onChange }) => {
  const onDateChange = index => v => {
    value[index] = v;
    onChange(value);
  };
  return (
    <span>
      <DatePicker
        style={dataStyle}
        value={value[0]}
        onChange={onDateChange(0)}
      />{' '}
      To
      <DatePicker
        style={dataStyle}
        value={value[1]}
        onChange={onDateChange(1)}
      />
    </span>
  );
};
const FormDateRange = withClassComponent(DataRange);

// 生成Form 表单可以用的组件
function withClassComponent(ComposedComponent) {
  return class NewComponent extends React.PureComponent {
    render() {
      return <ComposedComponent {...this.props} />;
    }
  };
}

export default class SimpleSearch extends React.PureComponent {
  static defaultProps = {
    filterList: [],
  };

  componentWillMount() {
    const { searchFields } = this.props;
    // 搜索表单 column

    // 状态列表组件
    const StatusList = props => (
      <Select {...props}>
        {statusData.map(key => (
          <Option key={key}>{msg.approStatus[key]}</Option>
        ))}
      </Select>
    );
    const FormStatusList = withClassComponent(StatusList);

    // 发票选择组件
    const InvoiceList = props => (
      <Select {...props}>
        {Object.keys(invoiceStatus).map(key => (
          <Option key={invoiceStatus[key]}>{invoiceStatus[key]}</Option>
        ))}
      </Select>
    );

    const FormInvoiceList = withClassComponent(InvoiceList);

    // 表单 column
    this.formColumn = [
      {
        dataIndex: _pay.createdAt,
        title: '创建日期',
        FormTag: <FormDateRange />,
        option: { initialValue: [moment().subtract(6, 'month'), moment()] },
      },
      {
        dataIndex: _pay.status,
        title: '状态',
        FormTag: (
          <FormStatusList
            allowClear
            style={{ width: 130 }}
            size="default"
          />
        ),
      },
      {
        dataIndex: _pay.invoice,
        title: '发票',
        FormTag: (
          <FormInvoiceList
            allowClear
            style={{ width: 130 }}
            size="default"
          />
        ),
      },
      { dataIndex: _pay.description, title: '描述' },
      { dataIndex: _pay.amount, title: '总金额', FormTag: <Input style={{ width: 80 }} /> },
      { dataIndex: _pay.paidNo, title: '凭证号' },
      {
        dataIndex: _pay.subjectId,
        title: '付款银行',
        FormTag: (
          <AccountSelect
            size="default"
            filterAction={$item => $item.filter($a => $a.get('bankFlag') === 'y')}
            style={{
              width: 180,
              display: 'inline-block',
              marginRight: 20,
              marginLeft: 5,
            }}
          />),
      },
    ].filter(e => searchFields.includes(e.dataIndex));
  }

  componentDidMount() {
    this.fetchDate();
  }

  formatSearchValue = ({ createdAt, ...values }) => ({
    createdAt:
    createdAt &&
    JSON.stringify(
      createdAt.map((m, index) => {
        if (index === 0) {
          m = m && m
            .hour(0)
            .minute(0)
            .second(0);
        } else if (index === 1) {
          m = m && m
            .hour(23)
            .minute(59)
            .second(59);
        }
        return m && m.format('YYYY-MM-DD HH:mm:ss');
      }),
    ),
    ...values,
  });
  fetchDate = () => {
    this.props.fetch(this.formatSearchValue(this.form.getFieldsValue()));
  };

  render() {
    return (
      <div className="search-bar">
        <SimpleForm
          wrappedComponentRef={e => (this.form = e && e.props.form)}
          columns={this.formColumn}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          layout="inline"
        />
        <Button htmlType="submit" size="default" onClick={this.fetchDate}>搜索</Button>
      </div>
    );
  }
}
