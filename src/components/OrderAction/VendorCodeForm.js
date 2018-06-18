import React from 'react';
import { Select } from 'antd';
import { getVendorCode } from '../../services/detail';

const Option = Select.Option;

export default class VendorCodeForm extends React.PureComponent {
  state = {
    codeList: [],
  };

  componentWillMount() {
    getVendorCode().then(e => {
      if (!e.error) {
        this.setState({ codeList: e.codes });
      }
    });
  }

  render() {
    return (
      <Select {...this.props}>
        {this.state.codeList.map(code => <Option key={code}>{code}</Option>)}
      </Select>
    );
  }
}
