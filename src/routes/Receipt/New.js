import React, { Fragment } from 'react';
import { connect } from 'dva';
import Immutable from 'immutable';
import { Card, Button, Divider, Input, DatePicker, InputNumber, Icon } from 'antd';
import SimpleReduxForm from 'components/Form/SimpleReduxForm';
import { UploadForm } from 'components/FormItem';
import { CurrencySelect, AccountSelect, CompanySelect } from 'components/Setting';
import { config } from 'utils';
import styles from './style.less';

const { TextArea } = Input;
const selectOption = { rules: [{ required: true, message: '请选择' }] };
export const getReceiptColumns = (isCreate = true, $value = Immutable.Map()) => [
  { dataIndex: 'paidNo', title: '凭证号', Component: <Input disabled placeholder="自动生成" /> },
  {
    dataIndex: 'payer',
    title: '付款方',
    option: { rules: [{ required: true, message: '请输入付款方' }] },
  },
  { dataIndex: 'companyId', title: '公司', Component: <CompanySelect /> },
  {
    dataIndex: 'subjectId',
    path: isCreate ? ['subjectId'] : ['subject', 'id'],
    title: '收款银行',
    Component: <AccountSelect
      disabled={!isCreate}
      filterAction={$list => $list.filter($item => $item.get('bankFlag') === 'y')}
    />,
    option: selectOption,
  },
  {
    dataIndex: 'currency',
    title: '币种',
    Component: <CurrencySelect />,
    option: selectOption,
  },
  {
    dataIndex: 'amount',
    title: '金额',
    option: { rules: [{ type: 'number', required: true, message: '请输入金额' }] },
    Component: <InputNumber style={{ width: '100%' }} disabled={!isCreate && $value.get('subjectStatus') === 'y'} />,
  },
  { dataIndex: 'amountCNY', title: '等值 RMB 金额', Component: <InputNumber style={{ width: '100%' }} /> },
  {
    dataIndex: 'collectDate',
    title: '收款日期',
    type: 'date',
    option: { rules: [{ type: 'object', required: true, message: '请选择日期' }] },
    Component: <DatePicker style={{ width: '100%' }} />,
  },
  {
    dataIndex: 'filePath',
    title: '文件上传',
    option: {
      valuePropName: 'fileList',
      getValueFromEvent: e => {
        if (Array.isArray(e)) {
          return e;
        }
        return e && e.fileList;
      },
    },
    Component: (
      <UploadForm>
        <Button><Icon type="upload" /> 上传文件</Button>
      </UploadForm>
    ),
  },
  {
    dataIndex: 'description',
    title: '描述',
    Component: <TextArea />,
  },
].filter(item => item.dataIndex !== 'amountCNY' || $value.get('currency') === config.currency.USD);

@connect(({ receipt }) => ({
  $value: receipt.$new,
}))
export default class New extends React.PureComponent {
  onValuesChange = obj => {
    let { dispatch, $value } = this.props;
    for (let key in obj) {
      // 将修改的值保存到 redux 中
      const paths = key.split(',');
      $value = $value.setIn(paths, obj[key]);
    }
    dispatch({ type: 'receipt/save', payload: { $new: $value } });
  };
  onCreate = () =>
    this.form.validateFields((err) => {
      if (!err) {
        this.props.dispatch({ type: 'receipt/create' });
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
