import React, { Fragment } from 'react';
import { Modal, DatePicker, message } from 'antd';
import moment from 'moment';
import { checkVendorCode } from '../../services/detail';
import VendorCodeForm from './VendorCodeForm';

export default class PrintBtn extends React.PureComponent {
  state = {
    visible: false,
    date: null,
    vendorCode: this.props.vendorCode || '',
  };
  onSubmit = () =>
    this.setState({
      visible: true,
      date: moment(this.props.date),
      vendorCode: this.props.vendorCode,
    });
  onDateChange = e => this.setState({ date: e });
  onVendorCodeChange = code => {
    if (code && this.props.vendorId) {
      checkVendorCode({
        vendorId: this.props.vendorId,
        vendorCode: code,
      }).catch(e => message.info(e.message));
    }

    this.setState({ vendorCode: code });
  };
  onOk = () => {
    if (this.props.onOk) {
      const date = this.state.date;
      const paidNo = this.props.paidNo;
      if (date && paidNo) {
        const month = date.format('MM');
        if (month !== paidNo.slice(4, 6)) {
          return message.error('凭证日期月份与凭证号月份不一致');
        }
      }
      this.props.onOk({
        orderId: this.props.id,
        voucherDate: date,
        vendorCode: this.state.vendorCode,
      });
    }
    this.setState({ visible: false });
  };

  render() {
    return (
      <Fragment>
        <span onClick={this.onSubmit}>
          {this.props.children}
        </span>
        <Modal
          visible={this.state.visible}
          title="凭证日期"
          onCancel={() => this.setState({ visible: false })}
          onOk={this.onOk}
        >
          <div>
            请选择凭证日期:
            <DatePicker
              defaultValue={moment(this.props.date)}
              onChange={this.onDateChange}
              style={{ marginLeft: 5 }}
            />
          </div>
          {this.props.vendorType === 'company' && (
            <div style={{ marginTop: 10 }}>
              请选择 Vendor Code:
              <VendorCodeForm
                mode="combobox"
                defaultValue={this.state.vendorCode}
                allowClear
                showSearch
                dropdownMatchSelectWidth={false}
                style={{ marginLeft: 5, width: 150 }}
                onChange={this.onVendorCodeChange}
              />
            </div>
          )}
        </Modal>
      </Fragment>
    );
  }
}
