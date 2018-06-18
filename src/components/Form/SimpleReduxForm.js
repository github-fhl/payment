import React from 'react';
import { Form, Input } from 'antd';

/*
* 简易的 Redux antd Form
* props
* labelCol:4          //label 宽度
* wrapperCol:14       //容器宽度
* columns:[]          //渲染表单的数组
*
* columns.dataIndex   //form字段名称
* columns.title       //该字段的标签
* columns.Component   //该字段的组件 默认 <Input />,
* columns.path      //表单选项参考antd form
* columns.width      //表单项宽度
* */

const FormItem = Form.Item;

@Form.create({
  mapPropsToFields(props) {
    const { $value, columns = [] } = props;
    const values = {};
    const getColumnsValues = columnsList =>
      columnsList.forEach(column => {
        const paths = column.path || [column.dataIndex];
        values[paths.join(',')] = Form.createFormField({
          value: $value.getIn(paths),
        });
      });
    getColumnsValues(columns);
    return values;
  },
  onFieldsChange: (props, values) =>
    props.onFieldsChange && props.onFieldsChange(values),
  onValuesChange: (props, values) =>
    props.onValuesChange && props.onValuesChange(values),
})
export default class SimpleForm extends React.PureComponent {
  static defaultProps = {
    layout: 'inline',
    columns: [],
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  buildForm = columns => {
    const {
      form: { getFieldDecorator },
      labelCol,
      wrapperCol,
    } = this.props;

    return columns.map(column => {
      let paths = column.path || [column.dataIndex];

      // 表单样式
      let style = {};
      if (column.width) {
        style.width = column.width;
      }
      if (column.color) {
        style.color = column.color;
      }

      // 表单控件选择
      let FormComponent = column.Component || <Input />;

      return (
        <FormItem
          style={style}
          key={column.dataIndex}
          label={column.title || column.dataIndex}
          labelCol={column.labelCol || labelCol}
          wrapperCol={column.wrapperCol || wrapperCol}
        >
          {getFieldDecorator(paths.join(','), column.option)(FormComponent)}
        </FormItem>
      );
    });
  };

  render() {
    const {
      columns,
      layout,
      className,
    } = this.props;
    const mainForm = this.buildForm(columns);
    return (
      <Form layout={layout} className={className}>
        {mainForm}
      </Form>
    );
  }
}
