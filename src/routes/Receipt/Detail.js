import React, { Fragment } from 'react';
import { connect } from 'dva';
import { format } from 'utils';
import { Card, Button, Divider, message } from 'antd';
import SimpleReduxForm from 'components/Form/SimpleReduxForm';
import ReceiptVoucher from './Detail/ReceiptVoucher';
import { updateSubject } from '../../services/receipt';
import { getReceiptColumns } from './New';
import styles from './style.less';

@connect(({ receipt, loading }) => ({
  $value: receipt.$detail,
  loading: loading.effects['detail/update'],
}))
export default class New extends React.PureComponent {
  componentDidMount() {
    this.onFetch();
  }

  onFetch = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'receipt/fetchDetail',
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
    dispatch({ type: 'receipt/save', payload: { $detail: $value } });
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
          if (column.dataIndex === 'filePath') {
            value = value && (value[0].value || value[0].response.obj);
          }
          payload[column.dataIndex] = value;
        });
        new Promise(resolve => dispatch({ type: 'receipt/update', resolve, payload }))
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
        dispatch({ type: 'receipt/fetchDetail' });
        dispatch({ type: 'user/getLog' });
        message.success('保存成功');
      }
    });
  };

  render() {
    const { $value, history, loading } = this.props;
    this.detailColumns = getReceiptColumns(false, $value);
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
          <div className={styles.action}>
            <Button type="primary" size="large" onClick={this.onSave} loading={loading}>保存</Button>
            <Button size="large" onClick={history.goBack}>返回</Button>
          </div>
        </Card>
        <Card bordered={false} title="设置财务科目" style={{ marginTop: 16 }}>
          <ReceiptVoucher $value={$value} onSave={this.onSaveObject} />
        </Card>
      </Fragment>
    );
  }
}
