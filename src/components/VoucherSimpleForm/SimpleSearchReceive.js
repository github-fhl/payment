import React from 'react';
import { DatePicker, Button } from 'antd';
import {
  voucherFields as _voucher,
} from '../../common/config';
import SimpleForm from './SimpleForm';
import './SimpleSearch.less';


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

class SimpleSearchReceive extends React.PureComponent {
  static defaultProps = {
    filterList: [],
  };

  componentWillMount() {
    const { searchFields } = this.props;
    const getTitle = item => {
      return item;
    };
    // 搜索表单 column
    // 表单 column
    this.formColumn = [
      { dataIndex: _voucher.voucherId, title: '凭证号' },
      {
        dataIndex: _voucher.voucherDate,
        title: '凭证日期',
        FormTag: <FormDateRange />,
      },
      { dataIndex: _voucher.bankAccount, title: '银行账号' },
      { dataIndex: _voucher.amount, title: '金     额' },
    ]
      .map(getTitle)
      .filter(e => searchFields.includes(e.dataIndex));
  }

  // componentDidMount() {
  //   this.fetchDate();
  // }

  formatSearchValue = ({ createdAt, voucherDate, ...values }) => ({
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
    voucherDate:
    voucherDate &&
    JSON.stringify(
      voucherDate.map((m, index) => {
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
    this.props.fetch({
      ...this.formatSearchValue(this.form.getFieldsValue()),
      transactionType: 'Receipt' });
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
        <Button htmlType="submit" size="default" onClick={this.fetchDate}>
          搜索
        </Button>
      </div>
    );
  }
}

export default SimpleSearchReceive;
