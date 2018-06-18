import React from 'react';
import { Upload, Select, DatePicker } from 'antd';
import { config } from 'utils';
import styles from './index.less';

const Option = Select.Option;

export class BankCodeTypeSelect extends React.PureComponent {
  render() {
    return (
      <Select {...this.props}>
        {config.bankCode.map(key => <Option key={key}>{key}</Option>)}
      </Select>
    );
  }
}


export class UploadForm extends React.PureComponent {
  render() {
    const { type, ...props } = this.props;
    const defaultProps = {
      className: styles.uploadBtn,
      action: '/api/v2/uploadFile',
    };
    return (<Upload {...defaultProps}{...props} />);
  }
}

const { RangePicker } = DatePicker;

export class RangeMonthPicker extends React.Component {
  state = {
    mode: ['month', 'month'],
    value: [],
    open: false,
  };

  onOpenChange = (open) => this.setState({ open });
  handlePanelChange = (value, mode) => {
    // 记录取值计数，确认是否关闭选择
    mode.forEach((key, index) => {
      if (key === 'date') {
        if (this.countDate) {
          this.countDate[index] = key;
        } else {
          this.countDate = [];
          this.countDate[index] = key;
        }
      }
    });
    let newState = { value };
    if (this.countDate[0] === 'date' && this.countDate[1] === 'date') {
      newState.open = false;
      this.countDate = null;
    }
    this.setState(newState);
    this.props.onChange(value);
  };

  render() {
    const { value, mode, open } = this.state;
    return (
      <RangePicker
        style={this.props.style}
        format="YYYY-MM"
        value={value}
        open={open}
        mode={mode}
        onOpenChange={this.onOpenChange}
        onPanelChange={this.handlePanelChange}
      />
    );
  }
}
