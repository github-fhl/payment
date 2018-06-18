import React from 'react';
import { connect } from 'dva';
import { Button, Input, Form, Icon, Select, Popconfirm } from 'antd';
import { format } from 'utils/index';
import './VoucherForm.less';


const Option = Select.Option;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};
const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 20, offset: 4 },
  },
};

@Form.create({
  onValuesChange: (props, values) =>
    props.onValuesChange && props.onValuesChange(values),
  mapPropsToFields(props) {
    const { $value } = props;
    // 设置重复表单的值
    return $value
      .reduce((value, $item, index) => {
        const path = [index, 'details'];
        value[path.join(',')] = Form.createFormField({
          value: $item.toJS(),
        });
        return value;
      }, {});
  },
})
export default class VoucherForm extends React.PureComponent {
  render() {
    const { $value } = this.props;
    const { getFieldDecorator } = this.props.form;


    const debitTotalAmount = $value.reduce((value, $item) => {
      if (!isNaN($item.get('money'))) {
        value += parseFloat($item.get('money'));
      }
      return value;
    }, 0);

    const formItems = $value.map(($item, index) => {
      const path = `${index},details`;
      return (
        <FormItem
          {...formItemLayout}
          label="科目名称"
          required={false}
          key={path}
        >
          {getFieldDecorator(path)(<PriceInput />)}
          <Popconfirm title="确认删除吗?" onConfirm={() => this.props.remove(index)}>
            <Icon
              className="dynamic-delete-button"
              type="minus-circle-o"
              disabled={$value.size === 1}
              style={{ marginLeft: '10px' }}
            />
          </Popconfirm>
        </FormItem>
      );
    });
    return (
      <Form onSubmit={this.handleSubmit}>
        {formItems}
        <FormItem {...formItemLayoutWithOutLabel}>
          <div>
            <span style={{ marginRight: '10px' }}>总额</span>
            <span style={{ color: '#CC3300' }}>{format.money(debitTotalAmount)}</span>
          </div>
          <Button
            type="dashed"
            onClick={this.props.add}
            style={{ width: '60%' }}
          >
            <Icon type="plus" />
            添加科目
          </Button>
        </FormItem>
      </Form>
    );
  }
}

@connect(state => ({ subjectId: state.setting.account }))
class PriceInput extends React.Component {
  onFormChange = field => e => {
    const { value, onChange } = this.props;
    const formValue = e.target ? e.target.value : e;
    onChange({ ...value, [field]: formValue });
  };

  render() {
    const { size, subjectId, value = {} } = this.props;

    return (
      <span>
        <Select
          showSearch
          placeholder="科目"
          value={value.subjectId}
          size={size}
          style={{ width: '25%' }}
          onChange={this.onFormChange('subjectId')}
          optionFilterProp="children"
          dropdownMatchSelectWidth={false}
          filterOption={(input, option) => option.props.children.includes(input)
          }
        >
          {subjectId &&
          subjectId.filter($item => $item.get('bankFlag') !== 'y').map($d => (
            <Option key={$d.get('id')}>
              {[$d.get('code'), $d.get('name')].filter(e => e).join(',')}
            </Option>
          ))}
        </Select>
        <Input
          value={value.money}
          type="text"
          placeholder="金额"
          size={size}
          onChange={this.onFormChange('money')}
          style={{ width: '20%', marginLeft: '3%' }}
        />
        <Input
          value={value.description}
          type="text"
          placeholder="备注"
          size={size}
          onChange={this.onFormChange('description')}
          style={{ width: '35%', marginLeft: '3%' }}
        />
      </span>
    );
  }
}
