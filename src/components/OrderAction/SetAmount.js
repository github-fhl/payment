import React, { Fragment } from 'react';
import { Button, Input, Modal, Checkbox } from 'antd';
import Immutable from 'immutable';
import { TableListImmutable } from 'components/TableList';
import { paymentFields as _pay } from '../../common/config';

/*
* 底部出纳修改付款金额的组件
* props:
* details: payment details
* onChange: 修改信息后的callBack,参数：修改后的$details
*
*/
export default class FinishSetAmount extends React.PureComponent {
  static defaultProps = {
    $payment: Immutable.Map(),
    onChange: () => {
    },
    hasAppro: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      isSubmit: false,
      rejectRemark: '',
      dataSource: props.$payment && props.$payment.get(_pay.detail),
    };
    const reimuserTitle = '成本中心';
    const payDateTitle = '归属月份';
    const remarkTitle = '备注';
    const moneyTitle = '限额';
    const vendorTitle = '收款方';
    const bankNumTitle = '银行账户';
    const bankNameTitle = '银行名称';

    // table columns
    this.columns = [
      {
        title: reimuserTitle,
        dataIndex: _pay.reimuserName,
        path: ['reimuser', 'name'],
      }, {
        title: payDateTitle,
        dataIndex: _pay.payDate,
      }, {
        title: moneyTitle,
        dataIndex: _pay.money,
        formTag: Input,
      },
      {
        title: vendorTitle,
        dataIndex: _pay.vendorName,
        path: ['vendor', 'name'],
      },
      {
        title: bankNumTitle, dataIndex: _pay.bankNum,
      },
      {
        title: bankNameTitle, dataIndex: _pay.bankName,
      },
      {
        title: remarkTitle,
        dataIndex: _pay.remark,
      },
    ];
  }

  componentWillReceiveProps(nextProps) {
    const { $payment } = nextProps;
    if (this.props.$payment !== $payment) {
      this.setState({ dataSource: $payment.get(_pay.detail) });
    }
  }

  onChangeSubmit = e => this.setState({ isSubmit: e.target.checked });
  onChangeRemark = e => this.setState({ rejectRemark: e.target.value });
  onOk = () => {
    this.setState({ visible: false });
    const { onChange, $payment } = this.props;
    const { dataSource, rejectRemark, isSubmit } = this.state;
    const details = $payment.get(_pay.detail);
    if (dataSource !== details || isSubmit) {
      onChange(this.state.dataSource, { rejectRemark, isSubmit });
    }
  };

  // 根据 this.columns 来编辑表格行
  addColumnsRender = columns => {
    return columns.map(column => ({
      ...column,
      render: (text, record, index) => {
        // 如果 formTag 存在 则渲染 formTag
        if (column.formTag) {
          const FormTag = column.formTag;
          const formValue = column.getValueFromEvent ? column.getValueFromEvent(text) : text;
          return (
            <FormTag
              {...column.formProps}
              value={formValue}
              placeholder={column.title}
              onChange={
                e => {
                  let value = e && e.target ? e.target.value : e;
                  if (column.getValueFromTag) {
                    value = column.getValueFromTag(value);
                  }
                  let newDateSource = this.state.dataSource.update(index, $p => $p.set(column.dataIndex, value));
                  this.setState({ dataSource: newDateSource });
                }
              }
            />
          );
        } else {
          return column.render ? column.render(text, record, index) : text;
        }
      },
    }));
  };

  render() {
    const { hasAppro } = this.props;
    const { isSubmit } = this.state;
    return (
      <Fragment>
        <Button type="danger" size="large" onClick={() => this.setState({ visible: true })}>
          修改金额
        </Button>
        <Modal
          maskClosable={false}
          visible={this.state.visible}
          onCancel={() => this.setState({ visible: false })}
          onOk={this.onOk}
          width={860}
          title="修改付款信息"
        >
          <TableListImmutable
            columns={this.addColumnsRender(this.columns)}
            dataSource={this.state.dataSource}
            pagination={false}
          />
          {hasAppro && (
            <div style={{ marginTop: 15 }}>
              <Checkbox onChange={this.onChangeSubmit}>更新付款信息，并提交出纳重新付款</Checkbox>
              {isSubmit && (
                <Input
                  onChange={this.onChangeRemark}
                  type="textarea"
                  placeholder="备注"
                  style={{ marginTop: 5 }}
                />
              )}
            </div>
          )}

        </Modal>
      </Fragment>
    );
  }
}
