import React from 'react';
import Immutable from 'immutable';
import { Row, Col, Button, Icon, Input } from 'antd';
import { paymentFields as _pay } from '../../common/config';


// 金额细则
export default class VendorFromDetail extends React.PureComponent {
  static defaultProps = {
    value: Immutable.fromJS([{}]),
  };
  add = () => this.props.onChange(this.props.value.push(Immutable.Map()));
  remove = e =>
    this.props.value.size > 1 &&
    this.props.onChange(this.props.value.delete(e));

  render() {
    const {
      onChange,
      value,
    } = this.props;

    return (
      <div>
        {value.map(($v, index) => {
          return (
            <Row key={index} gutter={8} type="flex" justify="space-between">
              <Col span={11}>
                <Input
                  value={$v.get(_pay.bankNum)}
                  placeholder="银行账户"
                  onChange={e =>
                    onChange(value.setIn([index, _pay.bankNum], e.target.value))
                  }
                />
              </Col>
              <Col span={11}>
                <Input
                  value={$v.get(_pay.bankName)}
                  placeholder="银行名称"
                  onChange={e =>
                    onChange(
                      value.setIn([index, _pay.bankName], e.target.value),
                    )
                  }
                />
              </Col>
              <Col span={2}>
                <Icon
                  className="dynamic-delete-button"
                  type="minus-circle-o"
                  disabled={value.size === 1}
                  onClick={() => this.remove(index)}
                />
              </Col>
            </Row>
          );
        })}
        <Button
          type="dashed"
          size="small"
          onClick={this.add}
          className="add-field"
        >
          <Icon type="plus" />
          {'添加账户'}
        </Button>
      </div>
    );
  }
}
