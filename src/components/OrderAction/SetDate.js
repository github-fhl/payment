import React, { Fragment } from 'react';
import { Modal, DatePicker } from 'antd';
import moment from 'moment';


export default class SetDate extends React.PureComponent {
  state = {
    visible: false,
    date: null,
  };
  onSubmit = () =>
    this.setState({
      visible: true,
      date: moment(this.props.date),
    });
  onDateChange = e => this.setState({ date: e });
  onOk = () => {
    if (this.props.onOk) {
      this.props.onOk({
        date: this.state.date.format('YYYY-MM-DD'),
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
          maskClosable={false}
          visible={this.state.visible}
          title="修改付款日期"
          onCancel={() => this.setState({ visible: false })}
          onOk={this.onOk}
        >
          <div>
            付款日期 :
            <DatePicker
              defaultValue={moment(this.props.date)}
              onChange={this.onDateChange}
              style={{ marginLeft: 5 }}
            />
          </div>
        </Modal>
      </Fragment>
    );
  }
}
