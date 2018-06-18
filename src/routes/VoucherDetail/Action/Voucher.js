import React from 'react';
import Immutable from 'immutable';
import qs from 'querystring';
import { Row, Col, Button, message } from 'antd';
import { format } from 'utils';
import VoucherBtn from 'components/OrderAction/VoucherBtn';
import VoucherForm from 'components/OrderAction/VoucherForm';
import { approStatus, paymentFields as _pay, host } from '../../../common/config';
import { setSubject, downloadVoucher } from '../../../services/detail';
import '../../../components/OrderAction/VoucherForm.less';

export default class Voucher extends React.PureComponent {
  static defaultProps = {
    $payment: Immutable.Map(),
  };

  constructor(props) {
    super(props);
    this.state = {
      $credit: Immutable.List(),
      $debit: Immutable.fromJS([{}]),
    };
  }

  componentDidMount() {
    this.getSubjects();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.$payment !== nextProps.$payment) {
      this.getSubjects(nextProps);
    }
  }

  onValuesChange = obj => {
    let $debit = this.state.$debit;
    for (let key in obj) {
      let path = key.split(',');
      let index = parseInt(path[0]);
      $debit = $debit.update(index, $item => $item.merge(obj[key]));
    }
    this.setState({ $debit });
  };

  getSubjects = (props = this.props) => {
    const { $payment } = props;
    const $subjects = $payment.get('ordersubjects');
    const $credit = $subjects.filter($v => $v.get('type') === 'credit');
    const debitSubject = $subjects.filter($v => $v.get('type') === 'debit');
    const $debit = debitSubject.size > 0 ? debitSubject : this.state.$debit;

    // 设置借方和贷方数据
    this.setState({ $debit, $credit });
  };
  remove = k => this.setState(prevState => ({
    $debit: prevState.$debit.delete(k),
  }));

  add = () => this.setState(prevState => ({
    $debit: prevState.$debit.push(Immutable.Map()),
  }));

  handleSubmit = e => {
    e.preventDefault();
    const { $payment, dispatch } = this.props;
    const { $credit, $debit } = this.state;

    const formatSubjectFields = (
      {
        type = 'debit',
        money,
        subjectId,
        description,
        id,
      }) => ({ id, type, money, subjectId, description }); // 格式化参数
    const values = $debit.toJS();

    // 汇总借方科目 和 贷方 科目一起发送给后台处理
    const totalSubject = values
      .filter(v => v)
      .map(formatSubjectFields)
      .concat($credit.toJS().map(formatSubjectFields));
    const params = {
      orderId: $payment.get('id'),
      details: totalSubject,
    };

    setSubject(params).then(r => {
      if (r.status === 'success') {
        dispatch({ type: 'user/getLog' });
        message.success('保存成功');
      }
    });
  };

  printVoucher = values => {
    values.voucherDate = format.date(values.voucherDate);
    window.open(
      'about:blank',
    ).location.href = `${host}/print/paymentVoucher/?${qs.stringify(
      values,
    )}`;
  };

  exportVoucher = values => {
    values.voucherDate = format.date(values.voucherDate);
    downloadVoucher(values)
      .then(e => {
        if (e.status === 'success') {
          window.open(
            'about:blank',
          ).location.href = `/api/${e.path}`;
        }
      });
  };

  render() {
    const { $payment } = this.props;
    const { $credit, $debit } = this.state;
    const hasPaySucceed = $payment.get('approStatus') === approStatus.paySucceed;
    const paidNo = $payment.get('paidNo');
    const voucherProps = {
      paidNo,
      vendorType: $payment.get('vendorType'),
      vendorCode: $payment.getIn(['orderdetails', 0, 'vendor', 'code']),
      vendorId: $payment.getIn(['orderdetails', 0, 'vendorId']),
      id: $payment.get('id'),
      date: $payment.get(_pay.voucherDate) || $payment.get(_pay.paidDate),
    };

    return (
      <Row type="flex" justify="start">

        {hasPaySucceed && (
          <Row style={{ width: '100%' }}>
            <Row>
              <Col span={24} style={{ fontSize: '16px', marginTop: '15px' }}>
                设置财务科目
                {paidNo && <span style={{ marginLeft: 20 }}>凭证号：{paidNo}</span>}
              </Col>
            </Row>
            <Row style={{ padding: '15px 0', marginBottom: '15px' }}>
              {/* 借方 debit */}
              <Col span={16}>
                <div style={{ color: '#108ee9', fontWeight: 'bold' }}>
                  借方：
                </div>
                <VoucherForm
                  onValuesChange={this.onValuesChange}
                  $value={$debit}
                  add={this.add}
                  remove={this.remove}
                />
                <Button type="primary" onClick={this.handleSubmit} size="large">
                  保存
                </Button>
                <VoucherBtn {...voucherProps} onOk={this.printVoucher}>
                  <Button size="large">打印</Button>
                </VoucherBtn>
                <VoucherBtn {...voucherProps} onOk={this.exportVoucher}>
                  <Button size="large">导出</Button>
                </VoucherBtn>
              </Col>

              {/* 贷方 credit */}
              <Col span={8}>
                <Row>
                  <Col style={{ color: '#CC3300', fontWeight: 'bold' }}>
                    贷方：
                  </Col>
                </Row>
                <Row style={{ marginLeft: '30px', marginTop: '10px' }}>
                  <Col>
                    <p>
                      <span>科目 : </span>
                      <span>{$credit.getIn([0, 'subject', 'name'])}</span>
                    </p>
                  </Col>
                </Row>
                <Row style={{ marginLeft: '30px', marginTop: '10px' }}>
                  <Col>
                    <p>
                      <span>金额 : </span>
                      <span>{format.money($credit.getIn([0, 'money']))}</span>
                    </p>
                  </Col>
                </Row>
                <Row style={{ marginLeft: '30px', marginTop: '10px' }}>
                  <Col>
                    <p>
                      <span>备注 : </span>
                      <span>{$credit.getIn([0, 'description'])}</span>
                    </p>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Row>
        )}
      </Row>
    );
  }
}
