import React, { Fragment } from 'react';
import { Card, Button, DatePicker, Radio, Switch } from 'antd';
import Immutable from 'immutable';
import { format, downloadUrl } from 'utils';
import SimpleReduxForm from 'components/Form/SimpleReduxForm';
import { DefaultSelect, TypeSelect, CompanySelect } from 'components/Setting';
import { analysisReimusers } from '../../services/analysis';

const RadioGroup = Radio.Group;
const { RangePicker } = DatePicker;
const formStyle = { minWidth: 550, width: 'auto' };
const $initValue = Immutable.Map({ excludeType: false });

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
      analysisReimusers($value.toJS()).then(e => {
        if (e.status === 'success') downloadUrl(`/api/${e.msg}`);
      });
    });
  };
  onExclude = checked => {
    this.setState(prev => ({ $value: prev.$value.set('excludeType', checked) }));
    return false;
  };

  render() {
    const { $value } = this.state;
    const formColumns = [
      {
        dataIndex: 'voucherDate',
        title: '报销月份',
        option: { rules: [{ type: 'array', required: true, message: '选择报销月份' }] },
        Component: <RangePicker style={formStyle} />,
      },
      {
        dataIndex: 'reimusers',
        title: (
          <Fragment>
            报销人员
            <span style={{ fontSize: '90%' }} onClick={e => e.preventDefault()}>
              <Switch
                style={{ marginLeft: 10, marginRight: 5 }}
                size="small"
                checked={!!this.state.$value.get('excludeType')}
                onChange={this.onExclude}
              />排除选择项
            </span>
          </Fragment>),
        Component: <DefaultSelect mode="tags" style={formStyle} />,
      },
      {
        dataIndex: 'companyId',
        title: '归属公司',
        option: { rules: [{ required: true, message: '选择归属公司' }] },
        Component: <CompanySelect style={formStyle} />,
      },
      {
        dataIndex: 'paytypes',
        title: '费用类别',
        Component: <TypeSelect mode="tags" style={formStyle} />,
      },
      {
        dataIndex: 'type',
        title: '查看方式',
        option: { rules: [{ required: true, message: '选择查看方式' }] },
        Component: (
          <RadioGroup>
            <Radio value="byMonth">按月份</Radio>
            <Radio value="byReimuser">按员工</Radio>
          </RadioGroup>
        ),
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
