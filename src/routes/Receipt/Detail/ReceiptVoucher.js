import React from 'react';
import Immutable from 'immutable';
import NP from 'number-precision';
import { Row, Col, Button, message } from 'antd';
import DescriptionList from 'components/DescriptionList';
import { format } from 'utils';
import VoucherForm from 'components/OrderAction/VoucherForm';


const { Description } = DescriptionList;
const initValue = Immutable.fromJS([{}]);
export default class ReceiptVoucher extends React.PureComponent {
  static defaultProps = {
    $value: Immutable.Map(),
  };

  constructor(props) {
    super(props);
    this.state = this.getSubjects(props);
  }

  componentWillReceiveProps(nextProps) {
    const { $value } = nextProps;
    if ($value !== this.props.$value) {
      this.setState(this.getSubjects(nextProps));
    }
  }

  onValuesChange = obj => {
    let $credit = this.state.$credit;
    for (let key in obj) {
      let path = key.split(',');
      let index = parseInt(path[0]);
      $credit = $credit.update(index, $item => $item.merge(obj[key]));
    }
    this.setState({ $credit });
  };

  getSubjects = (props = this.props) => {
    const $list = props.$value.get('ordersubjects');
    let $credit = initValue;
    let $debit = initValue;
    if ($list) {
      $credit = $list.filter(v => v.get('type') === 'credit');
      $debit = $list.filter(v => v.get('type') === 'debit');
      if ($credit.size < 1) $credit = initValue;
    }
    return { $credit, $debit };
  };
  reset = () => this.setState(this.getSubjects());
  remove = k => this.setState(prevState => ({
    $credit: prevState.$credit.delete(k),
  }));

  add = () => this.setState(prevState => ({
    $credit: prevState.$credit.push(Immutable.Map()),
  }));

  handleSubmit = e => {
    e.preventDefault();
    const { $value, onSave } = this.props;
    const { $credit } = this.state;

    // 检查数据是否填写完整
    if ($credit.some($item => !$item.get('money') || !$item.get('subjectId'))) return message.error('请将字段填写完整');

    // 检查借贷是否相等
    const amount = $value.get('amount');
    const debitAmount = $credit.reduce((v, $item) => NP.plus(v, $item.get('money')), 0);
    if (parseFloat(amount) !== debitAmount) return message.error('借贷需相等');

    // 格式化 贷方 科目发送给后台处理
    const formatSubjectFields = (
      {
        money,
        subjectId,
        description,
        id,
      }) => ({ id, type: 'credit', money: parseFloat(money), subjectId, description }); // 格式化参数
    const values = $credit.toJS();

    const totalSubject = values
      .filter(v => v)
      .map(formatSubjectFields);
    const params = {
      id: $value.get('id'),
      ordersubjects: totalSubject,
    };
    onSave(params);
  };

  render() {
    const { $debit, $credit } = this.state;
    return (
      <Row style={{ width: '100%' }}>
        <Row style={{ padding: '15px 0', marginBottom: '15px' }}>
          {/*  贷方 credit */}
          <Col span={16}>
            <div style={{ color: '#108ee9', fontWeight: 'bold', fontSize: 16 }}>
              贷方：
            </div>
            <VoucherForm
              onValuesChange={this.onValuesChange}
              $value={$credit}
              add={this.add}
              remove={this.remove}
            />
            <Row>
              <Col offset={4}>
                <Button type="primary" onClick={this.handleSubmit} size="large">
                  保存
                </Button>
                <Button onClick={this.reset} size="large" style={{ marginLeft: 10 }}>
                  重置
                </Button>
              </Col>
            </Row>
          </Col>

          {/* 借方 debit */}
          <Col span={8}>
            <DescriptionList
              col={1}
              size="large"
              title={(<span style={{ color: '#CC3300', fontWeight: 'bold' }}>借方：</span>)}
            >
              <Description term="银行">{$debit.getIn([0, 'subject', 'name'])}</Description>
              <Description term="金额">{format.money($debit.getIn([0, 'money']))}</Description>
            </DescriptionList>
          </Col>
        </Row>
      </Row>
    );
  }
}
