import React, { Fragment } from 'react';
import { connect } from 'dva';
import { Card, Button, Divider, message } from 'antd';
import SimpleReduxForm from 'components/Form/SimpleReduxForm';
import { getReceiptColumns } from './New';
import styles from './New.less';

@connect(({ bankStatement }) => ({
  $value: bankStatement.$detail,
}))
export default class New extends React.PureComponent {
  componentDidMount() {
    this.onFetch();
  }

  onFetch = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'bankStatement/fetchDetail',
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
    if ($value.get('paidNo')) message.error('当前状态已有凭证号无法编辑');
    dispatch({ type: 'bankStatement/save', payload: { $detail: $value } });
  };
  onSave = () =>
    this.form.validateFields((err) => {
      if (!err) {
        const action = new Promise(resolve => this.props.dispatch({ type: 'bankStatement/update', resolve }));
        action.then(e => {
          if (e && e.status === 'success') message.success('更新成功');
        });
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
              columns={getReceiptColumns(false, $value)}
              $value={$value}
              layout="horizontal"
              onValuesChange={this.onValuesChange}
            />
          </div>
          <Divider style={{ margin: '40px 0 24px' }} />
          <div className={styles.action}>
            <Button type="primary" size="large" onClick={this.onSave} disabled={$value.get('paidNo')}>保存</Button>
            <Button size="large" onClick={history.goBack}>取消</Button>
          </div>
        </Card>
      </Fragment>
    );
  }
}
