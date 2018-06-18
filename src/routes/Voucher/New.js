
import React, { Fragment } from 'react';
import { connect } from 'dva';
import Immutable from 'immutable';
import { Card, Button, Divider, Input, DatePicker, Radio } from 'antd';
import SimpleReduxForm from 'components/Form/SimpleReduxForm';
import { config } from 'utils';
import ReceiptVoucher from './Detail/ReceiptVoucher';
import styles from './style.less';


const { TextArea } = Input;
export const getReceiptColumns = [
  {
    dataIndex: 'vendorId',
    title: '供应商',
    Component: <Input disabled />,
  },
  {
    dataIndex: 'companyId',
    title: '公司',
    Component: <Input disabled />,
  },
  {
    dataIndex: 'costType',
    title: '费用类型',
    Component: (
      <Radio.Group>
        <Radio disabled value={config.costType.Inhouse}>{config.costType.Inhouse}</Radio>
        <Radio disabled value={config.costType.Production}>{config.costType.Production}</Radio>
      </Radio.Group>
    ),
  },
  {
    dataIndex: 'voucherid',
    title: '凭证号',
    Component: <Input disabled placeholder="自动生成" />,
  },
  {
    dataIndex: 'voucherDate',
    title: '凭证日期',
    Component: <DatePicker style={{ width: '100%' }} />,
  },
  {
    dataIndex: 'transactionType',
    title: '交易类型',
    Component: (
      <Radio.Group>
        <Radio disabled value={config.transactionType.Payment}>付款</Radio>
        <Radio disabled value={config.transactionType.Receipt}>收款</Radio>
      </Radio.Group>
    ),
  },
  {
    dataIndex: 'node',
    title: '备注',
    Component: <TextArea />,
  },
];

@connect(({ voucher }) => ({
  $value: voucher.$new,
}))
export default class New extends React.PureComponent {
  //  const bankStatements = JSON.parse(localStorage.getItem('bankStatementIds'))
  onValuesChange = obj => {
    let { dispatch, $value } = this.props;
    for (let key in obj) {
      // 将修改的值保存到 redux 中
      const paths = key.split(',');
      $value = $value.setIn(paths, obj[key]);
    }
    dispatch({ type: 'voucher/save', payload: { $new: $value } });
  };
  onCreate = () => {
    //  let { $value } = this.props;
    //  let value = $value.toJS();
    //  let voucherdetail = value.voucherDetails;
    //  let voucherdetailY = voucherdetail.filter(e => e.bankFlag === 'y');
    this.props.dispatch({ type: 'voucher/create' });
  };
  onSaveObject = obj => {
    let { dispatch, $value } = this.props;
    let value = $value.toJS();
    value.voucherDetails = value.voucherDetails || [];
    for (let key in obj) {
      // 将修改的值保存到 redux 中
      if (value.voucherDetails.every(item => item.row !== key)) {
        value.voucherDetails.push({ ...obj[key], bankFlag: 'n', row: key });
      } else {
        value.voucherDetails = value.voucherDetails.map(item => {
          if (item.row === key) {
            return obj[key];
          } else {
            return item;
          }
        });
      }
    }
    dispatch({ type: 'voucher/save', payload: { $new: Immutable.fromJS(value) } });
  };
  onRemove = k => {
    let { $value, dispatch } = this.props;
    let value = $value && $value.toJS();
    value.voucherDetails = value.voucherDetails && value.voucherDetails.filter(item => {
      if ((item.row && item.row.indexOf(k) < 0) || !item.row) {
        return item;
      } else return 0;
    });
    $value = Immutable.fromJS(value);
    dispatch({ type: 'voucher/save', payload: { $new: $value } });
  }
  render() {
    let { $value } = this.props;

    return (
      <Fragment>
        <Card bordered={false}>
          <div className={styles.form}>
            <SimpleReduxForm
              wrappedComponentRef={e => this.form = e && e.props.form}
              columns={getReceiptColumns}
              $value={$value}
              layout="horizontal"
              onValuesChange={this.onValuesChange}
            />
          </div>
          <Card bordered={false} title="设置财务科目" style={{ marginTop: 16 }}>
            <ReceiptVoucher $value={$value.get('voucherDetails')} onSave={this.onSaveObject} onRemove={this.onRemove} />
          </Card>
          <Divider style={{ margin: '40px 0 24px' }} />
          <div className={styles.action}>
            <Button type="primary" size="large" onClick={this.onCreate}>创建</Button>
            <Button type="primary" size="large" >确认</Button>
            <Button type="primary" size="large" >打印</Button>
            <Button type="primary" size="large" >导出</Button>
            <Button type="primary" size="large" >取消</Button>
          </div>
        </Card>
      </Fragment>
    );
  }
}

