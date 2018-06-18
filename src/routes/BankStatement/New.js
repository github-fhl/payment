import React, { Fragment } from 'react';
import { connect } from 'dva';
import Immutable from 'immutable';
import { Card, Button, Divider, Input, DatePicker, InputNumber, Radio } from 'antd';
import { config } from 'utils';
import SimpleReduxForm from 'components/Form/SimpleReduxForm';
import { AccountSelect } from 'components/Setting';
import CommonSelect from './components/CommonSelect';
import { fetchCommon } from '../../services/bankStatement';
import styles from './New.less';


const { TextArea } = Input;
let commonIdList = [];
const fetchCommonId = params => value =>
  fetchCommon({ ...params, mark: value }).then(({ status, objs }) => {
    if (objs) commonIdList = objs.map(({ id, description }) => ({ value: id, text: id, description }));
    return { status, data: commonIdList };
  });
const getRequired = message => ({ rules: [{ required: true, message }] });
export const getReceiptColumns = (isCreate = true, $value = Immutable.Map()) => [
  {
    dataIndex: 'costType',
    title: '费用类型',
    option: getRequired('请选择费用类型'),
    Component: (
      <Radio.Group disabled={!isCreate}>
        <Radio value={config.costType.Inhouse}>{config.costType.Inhouse}</Radio>
        <Radio value={config.costType.Production}>{config.costType.Production}</Radio>
      </Radio.Group>
    ),
  },
  {
    dataIndex: 'subjectId',
    title: '银行账号',
    option: getRequired('请选择银行账号'),
    Component: <AccountSelect
      disabled={!isCreate}
      valueRender={$item => [$item.get('name'), $item.get('bankNum')].filter(e => e).join(' , ')}
      filterAction={$list => $list.filter($item => $item.get('bankFlag') === 'y')}
    />,
  },
  {
    dataIndex: 'index',
    title: '流水号',
    Component: <InputNumber style={{ width: '100%' }} />,
    option: getRequired('请输入流水号'),
  },
  {
    dataIndex: 'date',
    title: '交易日期',
    option: getRequired('请选择交易日期'),
    Component: <DatePicker style={{ width: '100%' }} />,
  },
  {
    dataIndex: 'transactionType',
    title: '交易类型',
    option: getRequired('请选择交易类型'),
    Component: (
      <Radio.Group disabled={!isCreate}>
        <Radio value={config.transactionType.Payment}>付款</Radio>
        <Radio value={config.transactionType.Receipt}>收款</Radio>
      </Radio.Group>
    ),
  },
  {
    dataIndex: 'commonId',
    title: '收付款单号',
    type: 'date',
    Component: (
      <CommonSelect
        disabled={!isCreate}
        style={{ width: '100%' }}
        fetch={fetchCommonId({ transactionType: $value.get('transactionType'), subjectId: $value.get('subjectId') })}
        placeholder="请输入至少3位关键字"
      />),
  },
  {
    dataIndex: 'description',
    title: '描述',
    option: getRequired('请输入描述'),
    Component: <TextArea />,
  },
  { dataIndex: 'paidNo', title: '凭证号', Component: <Input style={{ width: '100%' }} disabled />, hide: isCreate },
  {
    dataIndex: 'money',
    title: '交易金额',
    option: { rules: [{ type: 'number', required: true, message: '请输入金额' }] },
    Component: <InputNumber style={{ width: '100%' }} />,
  }, {
    dataIndex: 'bankCharge',
    title: '银行手续费',
    option: { rules: [{ type: 'number', required: true, message: '请输入金额' }] },
    Component: <InputNumber style={{ width: '100%' }} />,
  },
  {
    dataIndex: 'balance',
    title: '账户余额',
    hide: isCreate,
    type: 'date',
    Component: <InputNumber style={{ width: '100%' }} disabled />,
  },
].filter(item => !item.hide);

@connect(({ bankStatement }) => ({
  $value: bankStatement.$new,
}))
export default class New extends React.PureComponent {
  onValuesChange = obj => {
    let { dispatch, $value } = this.props;

    // 将修改的值保存到 redux 中
    for (let key in obj) {
      const paths = key.split(',');
      $value = $value.setIn(paths, obj[key]);
    }

    // 修改commonId 则将commonId 附带的description 添加到$value中
    const checkFieldChange = filed => $value.get(filed) !== this.props.$value.get(filed);
    if (checkFieldChange('commonId') && commonIdList.length > 0) {
      const selectCommon = commonIdList.find(item => item.value === $value.get('commonId'));
      if (selectCommon) $value = $value.set('description', selectCommon.description);
    }
    if (checkFieldChange('transactionType')) $value = $value.delete('description').delete('commonId');

    dispatch({ type: 'bankStatement/save', payload: { $new: $value } });
  };
  onCreate = () =>
    this.form.validateFields((err) => {
      if (!err) {
        this.props.dispatch({ type: 'bankStatement/create' });
      }
    });

  render() {
    const { $value, history } = this.props;
    return (
      <Fragment>
        <Card bordered={false}>
          <div className={styles.form}>
            <SimpleReduxForm
              wrappedComponentRef={e => this.form = e && e.props.form}
              columns={getReceiptColumns(true, $value)}
              $value={$value}
              layout="horizontal"
              onValuesChange={this.onValuesChange}
            />
          </div>
          <Divider style={{ margin: '40px 0 24px' }} />
          <div className={styles.action}>
            <Button type="primary" size="large" onClick={this.onCreate}>创建</Button>
            <Button size="large" onClick={history.goBack}>取消</Button>
          </div>
        </Card>
      </Fragment>
    );
  }
}
