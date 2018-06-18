import React, { Fragment } from 'react';
import Immutable from 'immutable';
import { connect } from 'dva';
import classNames from 'classnames';
import {
  Row,
  Col,
  Form,
  Radio,
  Input,
  Modal,
  message,
} from 'antd';
import { config, msg, format } from 'utils';
import { SmallSelectionTable } from 'components/TableList';
import {
  CurrencySelect,
  TripleTypeCascader,
  CompanySelect,
  VendorSelect,
} from 'components/Setting';
import { BankCodeTypeSelect } from 'components/FormItem';
import AmountDetail from './PaymentFormAmountDetail';

const _pay = config.paymentFields;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

// 页面加载完成,设置payment字段默认值
const paymentFields = [
  _pay.paytypeId,
  _pay.description,
  _pay.id,
  _pay.currency,
  _pay.company,
  _pay.amount,
  _pay.detail,
  _pay.remark,
  _pay.vendorType,
];

// 页面加载完成，设置vendor字段默认值
const vendorFields = [
  _pay.vendorName,
  _pay.bankNum,
  _pay.bankName,
  _pay.contacter,
  _pay.telphone,
];
const bankFields = Object.keys(config.overseasFields);

const label = {
  [_pay.paytypeId]: '类别',
  [_pay.vendorType]: '收款方类别',
  [_pay.description]: '描述',
  [_pay.company]: '付款公司',
  [_pay.amount]: '总金额',
  [_pay.vendorName]: '收款方',
  [_pay.bankNum]: '账户',
  [_pay.bankName]: '银行名称',
  [_pay.detail]: '金额细则',
};

@Form.create({
  onValuesChange: (props, values) =>
    props.onValuesChange && props.onValuesChange(values),
  onFieldsChange: (props, values) =>
    props.onFieldsChange && props.onFieldsChange(values),
  mapPropsToFields(props) {
    const { payment } = props;
    // 设置表单的值
    let values = {};
    const addFormValue = list => {
      list.forEach(key => {
        values[key] = Form.createFormField({
          value: payment && payment.get(key),
        });
      });
    };
    addFormValue(paymentFields);
    addFormValue(vendorFields);
    addFormValue(bankFields);
    return values;
  },
})
@connect(({ setting }) => ({
  setting,
}))
export default class FormPayment extends React.PureComponent {
  static defaultProps = {
    isNew: false,
    payment: Immutable.Map(),
  };

  constructor(props) {
    super(props);
    this.state = {
      modalProps: Immutable.Map({
        visible: false,
        title: '请选择银行账号',
      }),
    };
    this.onChangeVendor = this.onChangeVendor.bind(this);
  }

  onChangeCurrency = (value) => {
    const { payment, setting } = this.props;
    let $detail = payment.get(_pay.detail);

    // 修改成美元时，则detail中的成本中心全部设为 others
    if (value === config.currency.USD && $detail && $detail.size > 0) {
      const $defaultItem = setting.default.find($d => $d.get('name') === 'others');
      if ($defaultItem) $detail = $detail.map($item => $item.set(_pay.reimuserId, $defaultItem.get('id')));
      if (this.props.onFieldsChange) this.props.onFieldsChange({ [_pay.detail]: { value: $detail } });
    }
  };
  onChangeVendorType = e => {
    if (e.target.value === config.vendorType.user) {
      if (this.props.onFieldsChange) {
        this.props.onFieldsChange({
          [_pay.currency]: { value: config.currency.CNY },
        });
      }
    }
  };

  onChangeVendor(e, vendorList) {
    const vendor = config.settingFields.vendor;
    const $vendor = vendorList.find(v => v.get('name') === e);
    if (!$vendor) {
      return;
    }
    const $detail = $vendor.get(vendor.detail);
    if (!$detail) {
      return;
    }
    if ($detail.size > 1) {
      // 多个银行账号选择
      const columns = [
        {
          title: label[_pay.bankNum],
          dataIndex: vendor.bankNum,
        },
        {
          title: label[_pay.bankName],
          dataIndex: vendor.bankName,
        },
        {
          title: '最近付款日期',
          dataIndex: vendor.lastPayDate,
        },
      ];
      const dataSource = $detail.toJS();
      this.vendor = undefined;
      const tableProps = {
        key: +new Date(),
        columns,
        dataSource,
        rowKey: (r, i) => i,
        rowSelection: {
          type: 'radio',
          onChange: (keys, rows) => {
            this.vendor = rows[0];
          },
        },
      };
      this.modal = <SmallSelectionTable {...tableProps} />;
      this.setState({
        modalProps: this.state.modalProps
          .set('visible', true)
          .set('onOk', () => {
            if (this.vendor) {
              // 根据 this.vendor 自动填充供应商信息

              if (this.props.onFieldsChange) {
                this.props.onFieldsChange({
                  [vendor.bankName]: { value: this.vendor[vendor.bankName] },
                  [vendor.bankNum]: { value: this.vendor[vendor.bankNum] },
                  [vendor.contacter]: { value: $vendor.get(vendor.contacter) },
                  [vendor.telphone]: { value: $vendor.get(vendor.telphone) },
                });
              }
              // setFieldsValue({
              //   [vendor.bankName]: this.vendor[vendor.bankName],
              //   [vendor.bankNum]: this.vendor[vendor.bankNum],
              //   [vendor.contacter]: $vendor.get(vendor.contacter),
              //   [vendor.telphone]: $vendor.get(vendor.telphone),
              // });
              this.setState({
                modalProps: this.state.modalProps.set('visible', false),
              });
            } else {
              message.error('请选择供应商');
            }
          }),
      });
    } else {
      // 根据vendor 自动填充供应商信息
      const obj = $detail.get(0) && $detail.get(0).toObject();
      let valueObj = {
        ...obj,
        [vendor.contacter]: $vendor.get(vendor.contacter),
        [vendor.telphone]: $vendor.get(vendor.telphone),
      };
      for (let key in valueObj) {
        valueObj[key] = { value: valueObj[key] };
      }
      if (this.props.onFieldsChange) this.props.onFieldsChange(valueObj);

      // setFieldsValue({
      //   ...obj,
      //   [vendor.contacter]: $vendor.get(vendor.contacter),
      //   [vendor.telphone]: $vendor.get(vendor.telphone),
      // });
    }
  }

  // 设置category
  getCategory = () => {
    const payment = this.props.payment;
    let categoryValue;
    if (Immutable.Map.isMap(payment)) {
      let catValue = payment.getIn([_pay.paytypeId, 0]); // 从表单 order 中获取 category
      if (!catValue) {
        let paytypeId = payment.get(_pay.paytypeId);
        if (Array.isArray(paytypeId)) catValue = paytypeId[0];
      }
      if (
        config.category.employee === catValue ||
        config.category.operatingCost
      ) {
        categoryValue = catValue;
      } else {
        categoryValue = payment.getIn([_pay.detail, 0, 'paytype', 'category']); // 从fetch order 中获取 category
      }
    }
    return categoryValue;
  };

  // checkAmount
  checkAmount = (rule, value, callback) => {
    const { form: { getFieldValue } } = this.props;
    const $details = getFieldValue(_pay.detail);
    if ($details) {
      let total = 0;
      $details.forEach(
        $detail => (total += parseFloat($detail.get(_pay.money))),
      );
      if (format.number(total) !== format.number(value)) {
        callback('总金额与金额详情合计不一致');
      } else {
        callback();
      }
    } else {
      callback();
    }
  };
  checkDetail = (rule, value, callback) => {
    const form = this.props.form;
    if (value) {
      form.validateFields([_pay.amount], { force: true });
    }
    callback();
  };

  render() {
    const { form: { getFieldDecorator }, payment, isNew } = this.props;
    const { modalProps } = this.state;
    const paytypeId = payment.get(_pay.paytypeId);
    const company = payment.get(_pay.company);
    const category = this.getCategory();
    const hasVendorType = category === config.category.employee;
    let vendorType;
    if (hasVendorType) {
      vendorType = payment.get(_pay.vendorType); // 通过表单或者默认值设置 vendorType
    }
    const hasVendor =
      category &&
      (category !== config.category.employee ||
        vendorType === config.vendorType.company);
    const hasDetail =
      (category === config.category.employee && vendorType) ||
      category === config.category.operatingCost;
    const isUsd = payment.get('currency') === config.currency.USD;
    const isOverseas = hasVendor && isUsd;

    const formLayout = { labelCol: { span: 6 }, wrapperCol: { span: 16 } };
    const ColProps = { span: 14 };
    getFieldDecorator(_pay.id);
    return (
      <Form className="form-lg">

        <Row type="flex" justify="center" align="top">

          <Col {...ColProps}>
            {/* 类型 */}
            <FormItem {...formLayout} label={label[_pay.paytypeId]}>
              {getFieldDecorator(_pay.paytypeId, {
                rules: [
                  {
                    required: true,
                    message: `缺少${label[_pay.paytypeId]}`,
                  },
                ],
              })(<TripleTypeCascader size="large" disabled={!isNew} />)}
            </FormItem>
            {/* 收款方类别 */}
            {hasVendorType && (
              <FormItem {...formLayout} label={label[_pay.vendorType]}>
                {getFieldDecorator(_pay.vendorType, {
                  onChange: this.onChangeVendorType,
                  rules: [
                    {
                      required: true,
                      message: `缺少${label[_pay.vendorType]}`,
                    },
                  ],
                })(
                  <RadioGroup size="large" disabled={!isNew}>
                    {Object.keys(config.vendorType).map(key => (
                      <Radio key={key} value={key}>
                        {msg.vendorType[key]}
                      </Radio>
                    ))}
                  </RadioGroup>,
                )}
              </FormItem>
            )}
            {/* 描述 */}
            <FormItem {...formLayout} label={label[_pay.description]}>
              {getFieldDecorator(_pay.description, {
                rules: [
                  {
                    required: true,
                    message: `缺少${label[_pay.description]}`,
                  },
                  {
                    message: '超过最大字符数200',
                    max: 200,
                  },
                ],
              })(<Input type="textarea" />)}
            </FormItem>

            {/* 币种 1.0 版本去掉 2.0 版本加上 */}
            <FormItem {...formLayout} label="币种">
              {getFieldDecorator(_pay.currency, {
                onChange: this.onChangeCurrency,
              })(<CurrencySelect disabled={vendorType === config.vendorType.user} />)}
            </FormItem>

            {/* 公司 */}
            <FormItem {...formLayout} label={label[_pay.company]}>
              {getFieldDecorator(_pay.company, {
                rules: [
                  {
                    required: true,
                    message: `缺少${label[_pay.company]}`,
                  },
                ],
              })(<CompanySelect />)}
            </FormItem>
            {/* 金额 */}
            <FormItem {...formLayout} label={label[_pay.amount]}>
              {getFieldDecorator(_pay.amount, {
                rules: [
                  {
                    required: true,
                    message: `缺少${label[_pay.amount]}`,
                  },
                  {
                    validator: this.checkAmount,
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col {...ColProps}>
            {/* 收款人 */}
            {hasVendor && (
              <FormItem {...formLayout} label={label[_pay.vendorName]}>
                {getFieldDecorator(_pay.vendorName, {
                  onChange: this.onChangeVendor,
                  rules: [
                    {
                      required: true,
                      message: `缺少${label[_pay.vendorName]}`,
                    },
                  ],
                })(<VendorSelect />)}
              </FormItem>
            )}

            {isOverseas && (
              <Fragment>

                {/* 国家地区 */}
                <FormItem {...formLayout} label="国家地区" className={classNames({ jsdn: !(hasVendor && isUsd) })}>
                  {getFieldDecorator(_pay.country, {
                    rules: [{ required: true, message: '缺少国家地区' },
                    ],
                  })(<Input />)}
                </FormItem>

                {/* 供应商地址 */}
                <FormItem {...formLayout} label="供应商地址" className={classNames({ jsdn: !(hasVendor && isUsd) })}>
                  {getFieldDecorator(_pay.vendorAddress, {
                    rules: [{ required: true, message: '缺少国家地区' },
                    ],
                  })(<Input />)}
                </FormItem>
              </Fragment>
            )}

            {/* 银行账号 */}
            {hasVendor && (
              <FormItem {...formLayout} label={label[_pay.bankNum]}>
                {getFieldDecorator(_pay.bankNum, {
                  rules: [
                    {
                      required: true,
                      message: `缺少${label[_pay.bankNum]}`,
                    },
                  ],
                })(<Input />)}
              </FormItem>
            )}
            {/* 银行名称 */}
            {hasVendor && (
              <FormItem {...formLayout} label={label[_pay.bankName]}>
                {getFieldDecorator(_pay.bankName, {
                  rules: [
                    {
                      required: true,
                      message: `缺少${label[_pay.bankName]}`,
                    },
                  ],
                })(<Input />)}
              </FormItem>
            )}
            {isOverseas && (
              <Fragment>

                {/* 银行地址 */}
                <FormItem {...formLayout} label="银行地址">
                  {getFieldDecorator(_pay.bankAddress, {
                    rules: [{ required: true, message: '缺少银行地址' },
                    ],
                  })(<Input />)}
                </FormItem>
                {/* 银行代号类别 */}
                <FormItem {...formLayout} label="银行代号类别" className={classNames({ jsdn: !(hasVendor && isUsd) })}>
                  {getFieldDecorator(_pay.bankCodeType, {
                    rules: [{ required: true, message: '缺少银行代号类别' },
                    ],
                  })(<BankCodeTypeSelect />)}
                </FormItem>

                {/* 银行代号 */}
                <FormItem {...formLayout} label="银行代号" className={classNames({ jsdn: !(hasVendor && isUsd) })}>
                  {getFieldDecorator(_pay.bankCode, {
                    rules: [{ required: true, message: '缺少银行代号' },
                    ],
                  })(<Input />)}
                </FormItem>
              </Fragment>
            )}

            {/* 联系人 */}
            {hasVendor && (
              <FormItem {...formLayout} label="联系人">
                {getFieldDecorator(_pay.contacter)(<Input />)}
              </FormItem>
            )}
            {/* 电话 */}
            {hasVendor && (
              <FormItem {...formLayout} label="电话">
                {getFieldDecorator(_pay.telphone)(<Input />)}
              </FormItem>
            )}
            <Modal
              {...modalProps.toObject()}
              width={600}
              maskClosable={false}
              onCancel={() =>
                this.setState({ modalProps: modalProps.set('visible', false) })
              }
            >
              {this.modal}
            </Modal>
          </Col>
          <Col span="22">
            {/* 金额细则 */}
            {hasDetail && (
              <FormItem
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                label={label[_pay.detail]}
              >
                {getFieldDecorator(_pay.detail, {
                  onChange: () => this.forceUpdate(),
                  rules: [
                    {
                      required: true,
                      type: 'object',
                      message: `缺少${label[_pay.detail]}`,
                    },
                    {
                      validator: this.checkDetail,
                    },
                  ],
                })(
                  <AmountDetail
                    payment={payment}
                    hasSummary={
                      payment.get('orderType') === config.orderType.Expense
                    }
                    isUsd={isUsd}
                    editIndex={0}
                    company={company}
                    type={vendorType}
                    paytypeId={paytypeId}
                  />,
                )}
              </FormItem>
            )}
          </Col>
        </Row>
      </Form>
    );
  }
}
