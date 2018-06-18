import React from 'react';
import { Form, Input } from 'antd';

const FormItem = Form.Item;

/*
* 简易的antd Form
* props
* labelCol:4          //label 宽度
* wrapperCol:14       //容器宽度
* columns:[]          //渲染表格的数组
*
* columns.dataIndex   //form字段名称
* columns.title       //该字段的标签
* columns.FormTag     //该字段的组件 默认 Input
* columns.option      //表单选项参考antd form
* */

class SimpleForm extends React.PureComponent {
  static defaultProps = {
    labelCol: { span: 4 },
    wrapperCol: { span: 14 },
  };

  render() {
    const {
      columns,
      form: { getFieldDecorator },
      labelCol,
      wrapperCol,
      layout,
    } = this.props;
    return (
      <Form layout={layout}>
        {columns.map(column => {
          const FormTag = column.FormTag;
          return (
            <FormItem
              label={column.title}
              key={column.dataIndex}
              labelCol={column.labelCol || labelCol}
              wrapperCol={column.wrapperCol || wrapperCol}
            >
              {getFieldDecorator(column.dataIndex, column.option)(
                FormTag || <Input {...column.props} />,
              )}
            </FormItem>
          );
        })}
      </Form>
    );
  }
}

export default Form.create()(SimpleForm);
