import React from 'react';
import { DatePicker, Button } from 'antd';
import {
  voucherFields as _voucher,
} from '../../common/config';
import SimpleForm from './SimpleForm';
import './SimpleSearch.less';


class SimpleSearch extends React.PureComponent {
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
        FormTag: <DatePicker.RangePicker />,
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
      transactionType: 'Payment' });
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

export default SimpleSearch;
