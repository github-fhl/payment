import React, { Fragment } from 'react';
import { Modal, DatePicker, InputNumber } from 'antd';
import SimpleForm from 'components/SimpleForm/SimpleForm';
import moment from 'moment';
import { format } from 'utils';
import { fetchRate, createRate } from '../../../services/bankStatement';

export default class InputRate extends React.PureComponent {
  state = {
    visible: false,
  };

  componentWillMount() {
    this.columns = [{
      dataIndex: 'date',
      title: '归属月份',
      option: { rules: [{ required: true, type: 'object', message: '请选择月份' }] },
      FormTag: <DatePicker.MonthPicker style={{ width: '100%' }} onChange={this.onDateChange} />,
    }, {
      dataIndex: 'rate',
      title: '汇率',
      option: { rules: [{ required: true, type: 'number', message: '请输入汇率' }] },
      FormTag: <InputNumber style={{ width: '100%' }} step={0.1} />,
    }];
  }

  onStart = () => {
    this.setState({ visible: true });
    if (!this.form || !this.form.getFieldValue('date')) {
      this.fetchNewValue();
    }
  };
  onDateChange = e => {
    if (e) {
      this.fetchNewValue(format.date(e, 'YYYY-MM'));
    } else if (this.form) {
      this.form.resetFields();
    }
  };
  onOk = () => {
    this.form.validateFields((err, values) => {
      if (!err) {
        values.date = format.date(values.date, 'YYYY-MM');
        createRate(values).then(e => {
          if (e.status === 'success') this.setState({ visible: false });
        });
      }
    });
  };
  fetchNewValue = (paramsDate = format.date(moment(), 'YYYY-MM')) =>
    fetchRate({ date: paramsDate }).then(e => {
      if (e.status === 'success' && this.form) {
        if (!e.obj) return this.form.resetFields(['rate']);
        const { date, rate } = e.obj;
        this.form.setFieldsValue({ date: moment(date), rate });
      }
    });

  render() {
    return (
      <Fragment>
        <span onClick={this.onStart}>
          {this.props.children}
        </span>
        <Modal
          maskClosable={false}
          visible={this.state.visible}
          title="录入汇率"
          onCancel={() => this.setState({ visible: false })}
          onOk={this.onOk}
        >
          <SimpleForm wrappedComponentRef={e => e && (this.form = e.props.form)} columns={this.columns} />
        </Modal>
      </Fragment>
    );
  }
}
