import React from 'react';
import { connect } from 'dva';
import {
  Row,
  Col,
  Form,
  Radio,
  Input,
} from 'antd';
import { config } from 'utils';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;


@connect(({ setting }) => ({

  setting,
}))
export default class FormPayment extends React.PureComponent {
  render() {
    const formLayout = { labelCol: { span: 6 }, wrapperCol: { span: 16 } };
    const ColProps = { span: 14 };
    return (
      <Form className="form-lg">
        <Row type="flex" justify="center" align="top">
          <Col {...ColProps}>
            {/* 费用类型 */}
            <FormItem {...formLayout} label="费用类型">
              <RadioGroup size="large">
                {Object.keys(config.voucherCosttype).map(key => (
                  <Radio key={key} value={key}>
                    {key}
                  </Radio>))}
              </RadioGroup>
            </FormItem>
            {/* 凭证号 */}
            <FormItem {...formLayout} label="凭证号"><Input type="textarea" />
            </FormItem>
            {/* 凭证日期 */}
            <FormItem {...formLayout} label="凭证日期"><Input type="textarea" />
            </FormItem>
            {/* 交易类型 */}
            <FormItem {...formLayout} label="交易类型">
              <RadioGroup size="large">
                {Object.keys(config.voucherTransactiontype).map(key => (
                  <Radio key={key} value={key}>
                    {key}
                  </Radio>))}
              </RadioGroup>
            </FormItem>
            {/* 备注 */}
            <FormItem {...formLayout} label="备注"><Input type="textarea" />
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
