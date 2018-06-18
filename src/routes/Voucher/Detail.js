import React, { Fragment } from 'react';
import { connect } from 'dva';
import { format } from 'utils';
import { Card, Divider, message } from 'antd';
import SimpleReduxForm from 'components/Form/SimpleReduxForm';
import ReceiptVoucherDetail from './Detail/ReceiptVoucherDetail';
import { updateSubject } from '../../services/receipt';
import { getReceiptColumns } from './New';
import styles from './style.less';

@connect(({ voucher, loading }) => ({
  $value: voucher.$detail,
  loading: loading.effects['detail/update'],
}))
export default class New extends React.PureComponent {
  componentDidMount() {
    this.onFetch();
  }

  onFetch = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'voucher/fetchDetail',
      payload: { id: match.params.id },
    });
  };

  onValuesChange = obj => {
    let { dispatch, $value } = this.props;
    for (let key in obj) {
      // 将修改的值保存到 redux 中
      const paths = key.split(',');
      $value = $value.setIn(paths, obj[key]);
    }
    dispatch({ type: 'voucher/save', payload: { $detail: $value } });
  };
  onSave = () =>
    this.form.validateFields((err) => {
      if (!err) {
        const { dispatch, $value } = this.props;

        // 将表单中的值转成参数
        const payload = { id: $value.get('id') };
        this.detailColumns.forEach(column => {
          const paths = column.path || [column.dataIndex];
          let value = $value.getIn(paths);
          if (column.type === 'date') {
            value = format.date(value);
          }
          payload[column.dataIndex] = value;
        });
        new Promise(resolve => dispatch({ type: 'voucher/update', resolve, payload }))
          .then(e => {
            if (e.status === 'success') {
              this.onFetch();
              message.success('保存成功');
            }
          });
      }
    });
  onSaveObject = params => {
    const { dispatch } = this.props;
    updateSubject(params).then(r => {
      if (r.status === 'success') {
        dispatch({ type: 'voucher/fetchDetail' });
        dispatch({ type: 'user/getLog' });
        message.success('保存成功');
      }
    });
  };

  render() {
    const { $value } = this.props;
    // const { $valuelist } = this.props.$value.get('voucherInfo');
    this.detailColumns = getReceiptColumns;
    return (
      <Fragment>
        <Card bordered={false}>
          <div className={styles.form}>
            <SimpleReduxForm
              wrappedComponentRef={e => this.form = e && e.props.form}
              columns={this.detailColumns}
              $value={$value}
              layout="horizontal"
              onValuesChange={this.onValuesChange}
            />
          </div>
          <Divider style={{ margin: '40px 0 24px' }} />
        </Card>
        <Card bordered={false} title="设置财务科目" style={{ marginTop: 16 }}>
          <ReceiptVoucherDetail $value={$value} onSave={this.onSaveObject} />
        </Card>
      </Fragment>
    );
  }
}
