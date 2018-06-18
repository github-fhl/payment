import React from 'react';
import Immutable from 'immutable';
import { connect } from 'dva';
import moment from 'moment';
import NP from 'number-precision';
import { Row, Col, Button, Modal, Icon, message, Input, InputNumber, DatePicker, Tooltip, Select, Switch } from 'antd';
import {
  DefaultSelect,
  VendorSelect,
  CompanySelect,
  TripleTypeCascader,
  TypeValueToText,
  CompanyValueToText,
} from 'components/Setting';
import { TableListImmutable } from 'components/TableList';
import Ellipsis from 'components/Ellipsis';
import { AmountFormat } from 'components/NumberInfo';
import { BankCodeTypeSelect } from 'components/FormItem';
import { config, format, getPayType } from 'utils';
import * as paymentOperate from '../../services/orderAction';
import style from './style.less';


const { paymentFields: _pay, settingFields: _set, vendorType, category } = config;
const { MonthPicker } = DatePicker;
const Option = Select.Option;

const detailFields = {
  [vendorType.company]: [_pay.company, _pay.paytypeId, _pay.reimuserId, _pay.payDate, _pay.money, _pay.remark], // 公司类型 detail字段
  [vendorType.user]: [_pay.company, _pay.paytypeId, _pay.reimuserId, _pay.payDate, _pay.money, _pay.vendorName, _pay.bankNum, _pay.bankName, _pay.remark], // 个人类型 detail字段
};

/*
* props.type 根据type设置detailFields 是否显示收款方
* props.paytypeId  获取成本中心的当月限额的参数
*
* */


// 金额细则

@connect(({ setting }) => ({
  setting,
}))
export default class AmountDetail extends React.PureComponent {
  static defaultProps = {
    type: vendorType.company,
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      editIndex: props.editIndex !== undefined ? props.editIndex : -1,
      dataSource: props.value,
      isSummary: false,
    };
  }

  componentWillMount() {
    this.getNewDataInital(this.props);
    const companyIdTitle = '归属公司';
    const paytypeIdTitle = '类型';
    const reimuserTitle = '成本中心';
    const payDateTitle = '归属月份';
    const remarkTitle = '备注';
    const moneyTitle = '金额';
    const vendorTitle = '收款方';
    const bankNumTitle = '银行账户';
    const bankNameTitle = '银行名称';

    this.viewTableColumns = [
      { title: companyIdTitle, dataIndex: _pay.company, render: text => <CompanyValueToText value={text} /> },
      { title: paytypeIdTitle, dataIndex: _pay.paytypeId, render: text => <TypeValueToText value={text} /> },
      {
        title: reimuserTitle,
        dataIndex: _pay.reimuserId,
        render: this.reimuserIdTableRender,
      },
      { title: payDateTitle, dataIndex: _pay.payDate },
      { title: moneyTitle, dataIndex: _pay.money, render: t => <AmountFormat value={t} /> },
      { title: vendorTitle, dataIndex: _pay.vendorName },
      { title: bankNumTitle, dataIndex: _pay.bankNum },
      { title: bankNameTitle, dataIndex: _pay.bankName },
      {
        title: remarkTitle,
        dataIndex: _pay.remark,
        render: text => <Ellipsis placement="left">{text}</Ellipsis>,
      },
    ];
    this.columns = [

      // 公司
      {
        title: companyIdTitle,
        dataIndex: _pay.company,
        render: (text, $record, index) => {
          if (this.state.editIndex !== index) {
            return <CompanyValueToText value={text} />;
          }

          return (
            <CompanySelect
              style={{ minWidth: 100 }}
              value={text}
              allowClear={false}
              placeholder={companyIdTitle}
              onChange={
                e => {
                  let newDateSource = this.state.dataSource.update(index, $p => $p.set(_pay.company, e));
                  this.setState({ dataSource: newDateSource });
                }
              }
            />
          );
        },
      },

      // 类型
      {
        title: paytypeIdTitle,
        dataIndex: _pay.paytypeId,
        render: (text, $record, index) => {
          if (this.state.editIndex !== index) {
            return <TypeValueToText value={text} />;
          }

          return (
            <TripleTypeCascader
              style={{ minWidth: 250 }}
              value={text}
              allowClear={false}
              placeholder={paytypeIdTitle}
              onChange={
                e => {
                  let newDateSource = this.state.dataSource.update(index, $p => $p.set(_pay.paytypeId, e));
                  newDateSource = this.onChangePaytypeId(e, $record, index, newDateSource);
                  this.setState({ dataSource: newDateSource });
                }
              }
            />
          );
        },
      },
      {
        title: reimuserTitle,
        dataIndex: _pay.reimuserId,
        render: (text, $record, index) => {
          if (this.state.editIndex !== index && text) {
            const $item = this.props.setting.default.find($i => $i.get('id') === text);
            return $item && $item.get('name');
          }

          // 如果是运营成本类型则 成本中心禁用
          let categoryCode = $record.getIn([_pay.paytypeId, 0]) || $record.get(_pay.paytypeId)[0];
          if (!category[categoryCode]) { // categoryCode 在config中找不到，则去setting中获取
            const $category = this.props.setting.type.find($i => $i.get('id') === categoryCode);
            categoryCode = $category ? $category.get('category') : categoryCode;
          }
          const disabled = categoryCode === category.operatingCost || this.props.isUsd;
          return (
            <DefaultSelect
              style={{ minWidth: 100 }}
              disabled={disabled}
              showPublicCost={disabled}
              value={text}
              allowClear={false}
              placeholder={reimuserTitle}
              onChange={
                e => {
                  let newDateSource = this.state.dataSource.update(index, $p => $p.set(_pay.reimuserId, e));
                  this.setState({ dataSource: newDateSource });
                  this.checkDefaultMoney(e, $record, index, newDateSource);
                }
              }
            />
          );
        },
      }, {
        title: payDateTitle,
        dataIndex: _pay.payDate,
        render: (text, $record, index) => {
          if (this.state.editIndex !== index) {
            return moment.isMoment(text) ? text.format('YYYY-MM') : text;
          }

          const value = text ? (moment.isMoment(text) ? text : moment(text)) : undefined;
          return (
            <MonthPicker
              style={{ minWidth: 90 }}
              value={value}
              placeholder={payDateTitle}
              onChange={
                e => {
                  let payValue = moment.isMoment(e) ? e.format('YYYY-MM') : e;
                  let newDateSource = this.state.dataSource.update(index, $p => $p.set(_pay.payDate, payValue));
                  this.setState({ dataSource: newDateSource });
                  this.checkDefaultMoney(payValue, $record, index, newDateSource);
                }
              }
            />
          );
        },
      }, {
        title: moneyTitle,
        dataIndex: _pay.money,
        render: (text, $record, index) => {
          if (this.state.editIndex !== index) {
            return <AmountFormat value={text} />;
          }
          return (
            <InputNumber
              style={{ minWidth: 80 }}
              value={text}
              placeholder={moneyTitle}
              onChange={
                e => {
                  let newDateSource = this.state.dataSource.update(index, $p => $p.set(_pay.money, e));
                  this.setState({ dataSource: newDateSource });
                }
              }
            />
          );
        },
      },
      {
        title: vendorTitle,
        dataIndex: _pay.vendorName,
        render: (text, $record, index) => {
          if (this.state.editIndex !== index) {
            return text;
          }

          return (
            <VendorSelect
              style={{ minWidth: 150 }}
              mode="combobox"
              value={text}
              placeholder={vendorTitle}
              onChange={
                e => {
                  let newDateSource = this.state.dataSource.update(index, $p => $p.set(_pay.vendorName, e));
                  newDateSource = this.onChangeVendorName(e, $record, index, newDateSource);
                  this.setState({ dataSource: newDateSource });
                }
              }
            />
          );
        },
      },
      {
        title: bankNameTitle,
        dataIndex: _pay.bankName,
        render: (text, $record, index) => {
          if (this.state.editIndex !== index) {
            return text;
          }
          const $vendor = this.getVendor($record.get(_pay.vendorName));
          let $detail = $vendor ? $vendor.get(_set.vendor.detail) : null;
          let selectedBankName = '';
          let detailDom = null;
          let bankList = [];
          if ($detail) {
            $detail.forEach(($d) => {
              if (bankList.indexOf($d.get(_set.vendor.bankName)) < 0) {
                bankList.push($d.get(_set.vendor.bankName));
              }
            });
          }
          return (
            (
              <Select
                style={{ minWidth: 100 }}
                mode="combobox"
                notFoundContent=""
                value={text}
                placeholder={detailDom}
                onChange={
                  e => {
                    let newDateSource = this.state.dataSource.update(index, $p => $p.set(_pay.bankName, e));
                    if ($detail) { // 根据账号查找 $detail中的银行名称
                      $detail.forEach($d => {
                        if (e) {
                          if ($d.get(_pay.bankName) === e) {
                            if (selectedBankName === '') {
                              selectedBankName = $d.get(_pay.bankNum);
                            } else {
                              selectedBankName = '';
                              return false;
                            }
                          }
                        }
                      });
                    }
                    if (selectedBankName) {
                      newDateSource = newDateSource.update(index, $p => $p.set(_pay.bankNum, selectedBankName));
                    }
                    this.setState({ dataSource: newDateSource });
                  }
                }
              >
                {
                  bankList && bankList.map($d => <Option key={$d}>{$d}</Option>)
                }
              </Select>
            )
          );
        },
      },
      {
        title: bankNumTitle,
        dataIndex: _pay.bankNum,
        render: (text, $record, index) => {
          if (this.state.editIndex !== index) {
            return text;
          }
          const $vendor = this.getVendor($record.get(_pay.vendorName));
          const selectedBankName = $record.get(_pay.bankName);
          const $detail = $vendor ? $vendor.get(_set.vendor.detail) : null;
          let detailDom = null;
          let banklist = [];
          if ($detail) {
            banklist = $detail.filter(($d) => {
              if (selectedBankName) {
                return $d.get(_pay.bankName) === selectedBankName;
              } else {
                return true;
              }
            }).toArray();
          }
          return (
            (
              <Select
                style={{ minWidth: 150 }}
                mode="combobox"
                notFoundContent=""
                value={text}
                placeholder={detailDom}
                onChange={
                  e => {
                    let newDateSource = this.state.dataSource.update(index, $p => $p.set(_pay.bankNum, e));
                    if ($detail) { // 根据账号查找 $detail中的银行名称
                      $detail.forEach($d => {
                        if ($d.get(_pay.bankNum) === e) {
                          newDateSource = newDateSource.update(index, $p => $p.set(_pay.bankName, $d.get(_pay.bankName)));
                          return false;
                        }
                      });
                    }
                    this.setState({ dataSource: newDateSource });
                  }
                }
              >
                {banklist && banklist.map(($d) => (
                  <Option key={$d.get(_pay.bankNum)}>{$d.get(_pay.bankNum)}</Option>))}
              </Select>
            )
          );
        },
      },
      {
        title: remarkTitle,
        dataIndex: _pay.remark,
        render: (text, $record, index) => {
          if (this.state.editIndex !== index) {
            return text;
          }

          return (
            <Input
              style={{ minWidth: 80 }}
              value={text}
              placeholder={remarkTitle}
              onChange={
                e => {
                  let newDateSource = this.state.dataSource.update(index, $p => $p.set(_pay.remark, e.target.value));
                  this.setState({ dataSource: newDateSource });
                }
              }
            />
          );
        },
      },
    ];
    this.viewColumns = {
      [vendorType.company]: this.viewTableColumns.filter(column => detailFields[vendorType.company].indexOf(column.dataIndex) > -1),
      [vendorType.user]: this.viewTableColumns,
    };
    this.editColumns = {
      [vendorType.company]: this.columns.filter(column => detailFields[vendorType.company].indexOf(column.dataIndex) > -1),
      [vendorType.user]: this.columns,
    };
    this.usdColumns = [
      {
        title: '银行地址',
        dataIndex: 'bankAddress',
        render: (text, $record, index) => {
          if (this.state.editIndex !== index) {
            return text;
          }
          return (
            <Input
              style={{ minWidth: 80 }}
              value={text}
              placeholder="银行地址"
              onChange={
                e => {
                  let newDateSource = this.state.dataSource.update(index, $p => $p.set('bankAddress', e.target.value));
                  this.setState({ dataSource: newDateSource });
                }
              }
            />
          );
        },
      },
      {
        title: '银行代号类别',
        dataIndex: 'bankCodeType',
        render: (text, $record, index) => {
          if (this.state.editIndex !== index) {
            return text;
          }
          return (
            <BankCodeTypeSelect
              style={{ minWidth: 80 }}
              value={text}
              placeholder="银行代号类别"
              onChange={
                e => {
                  let newDateSource = this.state.dataSource.update(index, $p => $p.set('bankCodeType', e));
                  this.setState({ dataSource: newDateSource });
                }
              }
            />
          );
        },
      },
      {
        title: '银行代号',
        dataIndex: 'bankCode',
        render: (text, $record, index) => {
          if (this.state.editIndex !== index) {
            return text;
          }
          return (
            <Input
              style={{ minWidth: 80 }}
              value={text}
              placeholder="银行代号"
              onChange={
                e => {
                  let newDateSource = this.state.dataSource.update(index, $p => $p.set('bankCode', e.target.value));
                  this.setState({ dataSource: newDateSource });
                }
              }
            />
          );
        },
      },
      {
        title: '国家地区',
        dataIndex: 'country',
        render: (text, $record, index) => {
          if (this.state.editIndex !== index) {
            return text;
          }
          return (
            <Input
              style={{ minWidth: 80 }}
              value={text}
              placeholder="国家地区"
              onChange={
                e => {
                  let newDateSource = this.state.dataSource.update(index, $p => $p.set('country', e.target.value));
                  this.setState({ dataSource: newDateSource });
                }
              }
            />
          );
        },
      },
      {
        title: '供应商地址',
        dataIndex: 'vendorAddress',
        render: (text, $record, index) => {
          if (this.state.editIndex !== index) {
            return text;
          }
          return (
            <Input
              style={{ minWidth: 80 }}
              value={text}
              placeholder="供应商地址"
              onChange={
                e => {
                  let newDateSource = this.state.dataSource.update(index, $p => $p.set('vendorAddress', e.target.value));
                  this.setState({ dataSource: newDateSource });
                }
              }
            />
          );
        },
      },
    ];
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.setState({ dataSource: nextProps.value });
    }
    if (this.props[_pay.paytypeId] !== nextProps[_pay.paytypeId]) {
      this.getNewDataInital(nextProps);
    }
  }


  onOk = () => {
    const { onChange, type, isUsd } = this.props;
    const { dataSource } = this.state;

    // 检查表单的有效性
    if (dataSource && dataSource.size > 0) {
      let msg = '请将信息填写完整';
      let checkFiled = detailFields[type];
      if (isUsd && type === config.vendorType.user) checkFiled = checkFiled.concat(Object.keys(config.overseasFields));

      const hasAllField = dataSource.every($data => checkFiled.every(field => {
        const value = $data.get(field);

        if (field === 'money' && value <= 0) {
          msg = '金额填写错误';
          return false;
        }
        return !!value || field === _pay.remark;
      }));
      if (hasAllField) { // 是否缺少有效字段
        onChange(dataSource.map($item => $item.filter(($i, key) => {
          if (this.props.isUsd && type === config.vendorType.user) {
            return $i;
          } else {
            // 不是外币个人供应商的话，去掉外币字段
            return this.usdColumns.every(column => column.dataIndex !== key);
          }
        })));
        this.setState({ visible: false });
      } else {
        message.error(msg);
      }
    } else {
      // 如果没有设置值，则返回空的字段，以保证 detail必选项能正常工作
      onChange();
      this.setState({ visible: false });
    }
  };
  onChangePaytypeId = (text, $record, index, dataSource) => {
    if (text && Array.isArray(text)) {
      const publicCostId = this.props.setting.default.find($d => $d.get('name') === 'publicCost').get('id');
      if (text[0] === category.operatingCost) {
        // 如果是运营成本类型则设置 reimuserId 为 publicCost;
        dataSource = dataSource.update(index, $detail => $detail.set(_pay.reimuserId, publicCostId));
      } else if ($record.get(_pay.reimuserId) === publicCostId) {
        // 如果是员工类型且paytypeId 为 publicCost，那么设置 reimuserId 为空;
        dataSource = dataSource.update(index, $detail => $detail.set(_pay.reimuserId));
      }
    }
    this.checkDefaultMoney(text, $record, index, dataSource);
    return dataSource;
  };
  onChangeVendorName = (text, $record, index, dataSource) => {
    const $vendor = this.getVendor(text);
    if ($vendor) {
      const $vendorDetail = $vendor.get(_set.vendor.detail);
      if ($vendorDetail) {
        let newDetail = {
          [_pay.bankName]: undefined,
          [_pay.bankNum]: undefined,
        };

        // 如果vendor detail 只有一条数据，则自动应用
        if ($vendorDetail.size === 1) {
          newDetail[_pay.bankName] = $vendorDetail.getIn([0, _pay.bankName]);
          newDetail[_pay.bankNum] = $vendorDetail.getIn([0, _pay.bankNum]);
        }
        dataSource = dataSource.update(index, $detail => $detail.merge(newDetail));
      }
    }
    return dataSource;
  };
  onClickSettingBtn = () => {
    this.getNewDataInital(this.props);
    this.setState(prevState => {
      return { visible: true, dataSource: prevState.dataSource ? prevState.dataSource : this.newData };
    });
  };
  onRow = (record, index) => {
    return {
      onClick: () => this.setState({ editIndex: index }), // 点击行
    };
  };

  getNewDataInital = (props = this.props) => {
    let newDate = {
      [_pay.company]: props.company,
      [_pay.paytypeId]: props[_pay.paytypeId],
      [_pay.payDate]: moment().format('YYYY-MM'),
    };

    // 根据 paytypeId 来确定是否设置成本中心
    const paytypeId = props[_pay.paytypeId];
    let paytypeCategory;
    if (Array.isArray(paytypeId)) {
      paytypeCategory = paytypeId[0];
    } else if (Immutable.List.isList(paytypeId)) {
      paytypeCategory = paytypeId.get(0);
    }

    if (paytypeCategory === category.operatingCost && !this.props.isUsd) {
      const $defaultItem = props.setting.default.find($d => $d.get('name') === 'publicCost');
      if ($defaultItem) newDate[_pay.reimuserId] = $defaultItem.get('id');
    }
    if (this.props.isUsd) {
      const $defaultItem = props.setting.default.find($d => $d.get('name') === 'others');
      if ($defaultItem) newDate[_pay.reimuserId] = $defaultItem.get('id');
    }

    return this.newData = Immutable.fromJS([newDate]);
  };
  getVendor = name => {
    // 获取当前的vendor bankNum list 输出
    let $vendor = Immutable.Map();
    let $vendorList = this.props.setting.vendor;
    if ($vendorList) {
      $vendor = $vendorList.find(v => v.get('name') === name);
    }
    return $vendor;
  };
  getDefaultMoney = ({ index, ...params }) => {
    // 是否含有金额细则
    paymentOperate.getDefaultMoney(params)
      .then(
        // 获取当月限额后自动设置金额
        e => {
          if (e.status === 'success') {
            const { rest, bankName, bankNum, vendorName } = e.obj;
            const newDetail = { money: rest, bankName, bankNum, vendorName };
            this.setState({ dataSource: this.state.dataSource.update(index, $detail => $detail.merge(newDetail)) });
          }
        },
      );
  };
  addNewData = () => {
    const dataSource = this.state.dataSource;
    const newDate = this.getNewDataInital();
    const newDataSource = Immutable.List.isList(dataSource) ? dataSource.concat(newDate) : newDate;
    this.setState({ dataSource: newDataSource, editIndex: newDataSource.size - 1 });
  };
  removeData = () => this.setState(
    state => {
      const newStataSource = state.dataSource.delete(state.editIndex);
      return {
        dataSource: newStataSource,
        editIndex: state.editIndex >= newStataSource.size ? -1 : state.editIndex,
      };
    });

  reimuserIdTableRender = text => {
    if (!text) return text;
    const $item = this.props.setting.default.find($i => $i.get('id') === text);
    return $item ? $item.get('name') : text;
  };

  countTotal = ($data) => {
    let amountTotal = 0;
    if (Immutable.List.isList($data)) {
      $data.forEach(
        $item => {
          if ($item.get('money') && !isNaN($item.get('money'))) {
            amountTotal += parseFloat($item.get('money'));
          }
        });
    }
    return amountTotal;
  };

  checkDefaultMoney = (text, $record, index, dataSource) => {
    const validDate = dataSource.getIn([index, _pay.payDate]);
    const payType = getPayType(dataSource.getIn([index, _pay.paytypeId]));
    const id = dataSource.getIn([index, _pay.reimuserId]);
    const orderType = this.props.payment.get('orderType');
    const params = { index, validDate, id, orderType, ...payType };
    if (validDate && payType.paytypeId && id) {
      this.getDefaultMoney(params);
    }
  };

  render() {
    const { value, type, isUsd } = this.props;
    const { dataSource, editIndex, isSummary } = this.state;
    const tableProps = {
      rowKey: (k, index) => index,
    };


    // 查看汇总金额模式显示格式
    let $viewDataSource = value;
    let viewColumns = this.viewColumns[type];

    if (isSummary) {
      const paytypeTotal = {};
      $viewDataSource = Immutable.Map();
      value.forEach(($item) => {
        const reimuserId = $item.get('reimuserId');
        let key = $item.get('paytypeId');
        key = Immutable.List.isList(key) ? key.get(-1) : key; // 如果表格编辑中选择，则最后一个是paytypeId
        key = Array.isArray(key) ? key[key.length - 1] : key; // 如果表格编辑中选择，则最后一个是paytypeId
        paytypeTotal[key] = NP.plus(paytypeTotal[key] || 0, $item.get('money')); // typeId 金额汇总

        $viewDataSource = $viewDataSource.update(reimuserId, $oldItem => {
          $oldItem = $oldItem || Immutable.Map();
          $oldItem = $oldItem.set('reimuserId', reimuserId);

          // 统计单人的 paytypeId 费用
          const $amountItem = Immutable.fromJS([{ id: $item.get('formId') || 'new', amount: $item.get('money') }]);
          $oldItem = $oldItem.update(key, $list => ($list ? $list.concat($amountItem) : $amountItem));

          // 单人所有 payType的金额汇总
          let personalAmount = $oldItem.get('personalAmount') || 0;
          personalAmount = NP.plus($item.get('money'), personalAmount);
          $oldItem = $oldItem.set('personalAmount', personalAmount);
          return $oldItem;
        });
      });
      $viewDataSource = $viewDataSource.toList();

      // 获取 paytype columns
      const paytypeColumns = Object.keys(paytypeTotal).map(dataIndex => ({
        dataIndex,
        className: 'tar',
        title: (
          <div className="total-amount-title">
            <span className="old" key="old">{dataIndex}</span>
            <span className="new" key="new">{format.money(paytypeTotal[dataIndex])}</span>
          </div>
        ),
        render: (t, $record) => {
          const $list = $record.get(dataIndex);
          if (!$list || $list.size === 0) return format.money(0);
          if ($list.size === 1) return format.money($list.getIn([0, 'amount']));
          if ($list.size > 1) {
            let total = 0;
            let listItem = $list.map($item => {
              if (!$item) return null;
              total = NP.plus(total, $item.get('amount'));
              return (
                <p key={$item.get('id')}>
                  <span>{$item.get('id')}:</span><span>{format.money($item.get('amount'))}</span>
                </p>
              );
            });
            return (
              <Tooltip placement="bottom" title={<div className={style.amountList}>金额组成：{listItem}</div>}>
                {total}
              </Tooltip>
            );
          }
        },
      }));
      viewColumns = [
        { dataIndex: 'no.', title: '序号', render: (t, r, index) => index + 1 },
        { dataIndex: 'reimuserId', title: '姓名', render: this.reimuserIdTableRender },
      ]
        .concat(paytypeColumns).concat(
          { dataIndex: 'personalAmount', title: '汇总', className: 'tar', render: t => format.money(t) },
        );
    }
    let editColumns = this.editColumns[type];
    if (isUsd && type === config.vendorType.user) {
      editColumns = [...editColumns, ...this.usdColumns];
      viewColumns = [...viewColumns, ...this.usdColumns.map(({ render, ...item }) => item)];
    }
    return (
      <div>
        <TableListImmutable
          {...tableProps}
          dataSource={$viewDataSource}
          pagination={false}
          showHeader
          columns={viewColumns}
          bordered={false}
          size="small"
          className="small-table"
          footer={() => (
            <Row type="flex" justify="space-between" className="view-footer">
              <Col>合计: <AmountFormat value={this.countTotal(value)} /></Col>
            </Row>
          )}
        />
        <div className={style.detailAction}>
          {
            this.props.hasSummary &&
            <span><Switch checked={isSummary} onChange={checked => this.setState({ isSummary: checked })} /> 查看汇总</span>
          }
          <Button onClick={this.onClickSettingBtn}>设置金额细则</Button>
        </div>
        <Modal
          onCancel={() => this.setState({ visible: false })}
          maskClosable={false}
          visible={this.state.visible}
          title="设置金额细则"
          width={type === vendorType.company ? 900 : 1350}
          onOk={this.onOk}
        >
          <TableListImmutable
            {...tableProps}
            pagination={false}
            bordered={false}
            size="small"
            columns={editColumns}
            dataSource={dataSource}
            onRow={this.onRow}
            rowClassName={(e, index) => (index === editIndex ? 'editRow' : '')}
            footer={() => (
              <Row type="flex" justify="space-between">
                <Col>
                  <Button onClick={this.addNewData}><Icon type="plus" />增加</Button>
                  <Button
                    onClick={this.removeData}
                    style={{ marginLeft: 5 }}
                    disabled={editIndex === -1 || editIndex >= dataSource.size}
                  >
                    <Icon type="minus" />删除
                  </Button>
                </Col>
                <Col>合计:<AmountFormat value={this.countTotal(dataSource)} /></Col>
              </Row>
            )}
          />
        </Modal>
      </div>
    );
  }
}
