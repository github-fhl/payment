import React from 'react';
import { Select } from 'antd';
import debounce from 'lodash-decorators/debounce';

const Option = Select.Option;
export default class CommonSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      value: '',
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.setState({ value: nextProps.value, data: [] });
    }
  }

  @debounce(200)
  handleChange(value) {
    const { onChange, fetch } = this.props;
    if (typeof onChange === 'function') onChange(value);
    this.setState({ value });

    // 输入的值长度大于3位则 获取 commonId 列表
    if (value && value.length >= 3) {
      const fetchAction = fetch(value);
      if (fetchAction && fetchAction.then) {
        fetchAction.then(e => {
          if (e.status === 'success') this.setState({ data: e.data });
        });
      }
    }
  }

  render() {
    const options = this.state.data.map(d => <Option key={d.value}>{d.text}</Option>);
    return (
      <Select
        mode="combobox"
        value={this.state.value}
        disabled={this.props.disabled}
        placeholder={this.props.placeholder}
        style={this.props.style}
        defaultActiveFirstOption={false}
        showArrow={false}
        filterOption={false}
        onChange={this.handleChange}
      >
        {options}
      </Select>
    );
  }
}
