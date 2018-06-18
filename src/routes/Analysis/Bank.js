import React from 'react';
import { Card, Button } from 'antd';
import Immutable from 'immutable';
import SimpleReduxForm from 'components/Form/SimpleReduxForm';
import { AccountSelect } from 'components/Setting';
import { RangeMonthPicker } from 'components/FormItem';
import { downloadUrl, format } from '../../utils';
import { analysisBank } from '../../services/analysis';

const formStyle = { minWidth: 550, width: 'auto' };
const $initValue = Immutable.Map();

export default class Employee extends React.PureComponent {
  state = {
    $value: $initValue,
  };
  onValuesChange = obj => {
    let $value = this.state.$value;
    for (let key in obj) {
      $value = $value.set(key, obj[key]);
    }
    this.setState({ $value });
  };
  onDownload = () => {
    this.form.validateFields((err) => {
      if (err) return;
      let { $value } = this.state;
      $value = $value.update('voucherDate', ([begin, end]) => ({ begin: format.date(begin), end: format.date(end) }));
      analysisBank($value.toJS()).then(e => {
        if (e.status === 'success') downloadUrl(`/api/${e.msg}`);
      });
    });
  };
  onExclude = checked => {
    this.setState(prev => ({ $value: prev.$value.set('exclude', checked) }));
    return false;
  };

  render() {
    const { $value } = this.state;
    const formColumns = [
      {
        dataIndex: 'voucherDate',
        title: '月份',
        option: { rules: [{ type: 'array', required: true, message: '选择报销月份' }] },
        Component: <RangeMonthPicker style={formStyle} />,
      },
      {
        dataIndex: 'subjectIds',
        title: '银行账号',
        Component: (
          <AccountSelect
            filterAction={$list => $list.filter($item => ($item.get('bankFlag') === 'y'))}
            mode="tags"
            style={formStyle}
          />),
      },
    ];
    return (
      <Card bordered={false}>
        <SimpleReduxForm
          $value={$value}
          layout="vertical"
          columns={formColumns}
          onValuesChange={this.onValuesChange}
          wrapperCol={{ span: 24 }}
          wrappedComponentRef={e => this.form = e && e.props.form}
        />
        <Button type="primary" onClick={this.onDownload}>下载</Button>
      </Card>
    );
  }
}
