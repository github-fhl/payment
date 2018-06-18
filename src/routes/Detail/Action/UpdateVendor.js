import React, { Fragment } from 'react';
import { Button, Input, Modal, Checkbox, Popconfirm } from 'antd';
import { connect } from 'dva';
import { config, format } from 'utils';
import { TableListImmutable } from 'components/TableList';
import { updateVendor } from '../../../services/detail';


/*
* 底部临时修改vendor 付款信息的组建
* props:
* details: payment details
* onChange: 修改信息后的callBack,参数：修改后的$details
* intl:多语言组建
*
*/
const { paymentFields: _pay } = config;

@connect((state, props) => ({
  details: props.$payment && props.$payment.get(config.paymentFields.detail),
}))
export default class UpdateVendor extends React.PureComponent {
  static defaultProps = {
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
      dataSource: props.details,
    };
    const reimuserTitle = '成本中心';
    const payDateTitle = '归属月份';
    const remarkTitle = '备注';
    const moneyTitle = '金额';
    const vendorTitle = '收款方';
    const bankNumTitle = '银行账户';
    const bankNameTitle = '银行名称';

    // table columns
    this.columns = [
      {
        title: reimuserTitle,
        dataIndex: _pay.reimuserName,
      }, {
        title: payDateTitle,
        dataIndex: _pay.payDate,
      }, {
        title: moneyTitle,
        dataIndex: _pay.money,
        className: 'tar',
        render: amount => format.money(amount),
      },
      {
        title: vendorTitle,
        dataIndex: _pay.vendorName,
      },
      {
        title: bankNumTitle,
        dataIndex: _pay.bankNum,
        formTag: Input,
      },
      {
        title: bankNameTitle,
        dataIndex: _pay.bankName,
        formTag: Input,
      },
      {
        title: remarkTitle,
        dataIndex: _pay.remark,
      },
      {
        title: '操作',
        dataIndex: 'operate',
        render: (t, $record) => {
          if (this.props.details && this.props.details.size > 1) {
            return (
              <Popconfirm
                title="确认要删除吗?"
                onConfirm={() => this.onDeleteDetail($record)}
              >
                <a>删除</a>
              </Popconfirm>
            );
          }
        },
      },
    ];
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.details !== nextProps.details) {
      this.setState({ dataSource: nextProps.details });
    }
  }

  onDeleteDetail = $item => {
    updateVendor({
      id: this.props.$payment.get('id'),
      details: [{
        operate: 'delete', // 后台操作标记
        orderdetailId: $item.get('id'),
        [_pay.vendorName]: $item.getIn(['vendor', 'name']),
        [_pay.bankName]: $item.get(_pay.bankName),
        [_pay.bankNum]: $item.get(_pay.bankNum),
      }],
    }).then(e => {
      if (e.status === 'success') {
        this.props.dispatch({ type: 'detail/fetch' });
        this.props.dispatch({ type: 'user/getLog' });
      }
    });
  };
  onChangeSubmit = e => this.setState({ isSubmit: e.target.checked });
  onChangeRemark = e => this.setState({ rejectRemark: e.target.value });
  onOk = () => {
    const { dataSource, rejectRemark, isSubmit } = this.state;
    const { details, dispatch, $payment } = this.props;
    if (dataSource !== details || isSubmit) {
      const params = {
        rejectRemark,
        isSubmit,
        id: $payment.get('id'),
        details: dataSource.map($item => ({
          operate: 'update', // 后台操作标记
          orderdetailId: $item.get('id'),
          [_pay.vendorName]: $item.getIn(['vendor', 'name']),
          [_pay.bankName]: $item.get(_pay.bankName),
          [_pay.bankNum]: $item.get(_pay.bankNum),
        })).toJS(),
      };
      updateVendor(params).then(e => {
        if (e.status === 'success') {
          this.setState({ visible: false });
          dispatch({ type: 'detail/fetch' });
          dispatch({ type: 'user/getLog' });
        }
      });
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
    const { isSubmit } = this.state;
    return (
      <Fragment>
        <Button type="primary" size="large" onClick={() => this.setState({ visible: true })}>
          修改付款信息
        </Button>
        <Modal
          visible={this.state.visible}
          onCancel={() => this.setState({ visible: false })}
          onOk={this.onOk}
          width={860}
          title="修改付款信息"
        >
          <TableListImmutable
            pagination={false}
            columns={this.addColumnsRender(this.columns)}
            dataSource={this.state.dataSource}
          />
          <div style={{ marginTop: 15 }}>
            <Checkbox onChange={this.onChangeSubmit}>更新付款信息，并提交出纳重新付款</Checkbox>
            {
              isSubmit && (
                <Input
                  onChange={this.onChangeRemark}
                  type="textarea"
                  placeholder="备注"
                  style={{ marginTop: 5 }}
                />
              )}
          </div>
        </Modal>
      </Fragment>
    );
  }
}
