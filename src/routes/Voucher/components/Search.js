import React from 'react';
import { Form, DatePicker, Button, Input, InputNumber, Select } from 'antd';
import { config } from 'utils';
import { AccountSelect } from 'components/Setting';
import styles from './Search.less';

const FormItem = Form.Item;

@Form.create({
  onValuesChange: (props, changeValues, allValues) => props.onChange && props.onChange(allValues),
  mapPropsToFields(props) {
    const { value } = props;
    const newValues = {};
    for (let key in value) {
      newValues[key] = Form.createFormField({
        value: value[key],
      });
    }
    return newValues;
  },
})
export default class SearchForm extends React.PureComponent {
  static defaultProps = {
    filterList: [],
  };

  componentDidMount() {
    // this.fetchDate();
  }

  onSubmit = e => {
    e.preventDefault();
    this.fetchDate();
  };
  fetchDate = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) this.props.fetch(values);
    });
  };

  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <Form layout="inline" className={styles.searchForm} onSubmit={this.onSubmit}>
        <FormItem label="银行账号">
          {getFieldDecorator('subjectId', {
            rules: [{ required: true, message: '请选择银行账号' }],
          })(
            <AccountSelect
              style={{ width: 150 }}
              filterAction={$list => $list.filter($item => $item.get('bankFlag') === 'y')}
              valueRender={$item => [$item.get('name'), $item.get('code'), $item.get('bankNum')].filter(e => e).join(' , ')}
              dropdownMatchSelectWidth={false}
            />,
          )}
        </FormItem>
        <FormItem label="流水号">
          {getFieldDecorator('index')(<InputNumber style={{ width: '100%' }} />)}
        </FormItem>
        <FormItem label="交易日期">
          {getFieldDecorator('date')(<DatePicker.RangePicker />)}
        </FormItem>
        <FormItem label="收付款单号">
          {getFieldDecorator('commonId')(<Input />)}
        </FormItem>
        <FormItem label="交易类型">
          {getFieldDecorator('transactionType')(
            <Select>
              <Select.Option value={config.transactionType.Payment}>付款</Select.Option>
              <Select.Option value={config.transactionType.Receipt}>收款</Select.Option>
            </Select>,
          )}
        </FormItem>
        <FormItem label="凭证号">
          {getFieldDecorator('paidNo')(<Input />)}
        </FormItem>
        <FormItem label="描述">
          {getFieldDecorator('description')(<Input />)}
        </FormItem>
        <FormItem label="交易金额">
          {getFieldDecorator('money')(<Input />)}
        </FormItem>
        <FormItem>
          <Button htmlType="submit" type="primary">搜索</Button>
        </FormItem>
      </Form>);
  }
}
