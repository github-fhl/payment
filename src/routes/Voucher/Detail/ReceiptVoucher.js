
import React, { Fragment } from 'react';
import Immutable from 'immutable';
import { Row, Col } from 'antd';
import DescriptionList from 'components/DescriptionList';
import VoucherForm from 'components/OrderAction/VoucherForm';


const { Description } = DescriptionList;
const initValue = Immutable.fromJS([{}]);
export default class ReceiptVoucher extends React.PureComponent {
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
    let $bankFlagDateN = this.state.$bankFlagDateN;
    for (let key in obj) {
      let path = key.split(',');
      let index = parseInt(path[0]);
      $bankFlagDateN = $bankFlagDateN.update(index, $item => $item.merge(obj[key]));
    }
    this.setState({ $bankFlagDateN });
    this.props.onSave(obj);
  };
  getSubjects = (props = this.props) => {
    const $list = props.$value;
    let $bankFlagDate = initValue;
    let $bankFlagDateN = initValue;
    if ($list) {
      $bankFlagDate = $list.filter(v => v.get('bankFlag') === 'y');
      $bankFlagDateN = $list.filter(v => v.get('bankFlag') === 'n');
    }
    return { $bankFlagDate, $bankFlagDateN };
  };
  reset = () => this.setState(this.getSubjects());
  remove = k => {
    this.setState(prevState => ({
      $bankFlagDateN: prevState.$bankFlagDateN.delete(k),
    }));
    this.props.onRemove(k);
  };

  add = () => this.setState(prevState => ({
    $bankFlagDateN: prevState.$bankFlagDateN.push(Immutable.Map()),
  }));

  render() {
    const { $bankFlagDate, $bankFlagDateN } = this.state;
    return (
      <Fragment>
        <Row style={{ width: '100%' }}>
          <Row style={{ padding: '15px 0', marginBottom: '15px' }}>
            {/*  贷方 credit */}
            <Col span={16}>
              <div style={{ color: '#108ee9', fontWeight: 'bold', fontSize: 16 }}>
                {$bankFlagDate.getIn([0, 'type']) ? '贷方' : '借方'}
              </div>
              <VoucherForm
                wrappedComponentRef={e => this.form = e && e.props.form}
                onValuesChange={this.onValuesChange}
                $value={$bankFlagDateN}
                add={this.add}
                remove={this.remove}
              />
            </Col>

            {/* 借方 debit */}
            <Col span={8}>
              <DescriptionList
                col={1}
                size="large"
                title={(<span style={{ color: '#CC3300', fontWeight: 'bold' }}>{$bankFlagDate.getIn([0, 'type']) ? '贷方' : '借方'}</span>)}
              >
                <Description term="银行">{$bankFlagDate.getIn([0, 'subjectId'])}</Description>
                <Description term="金额">{$bankFlagDate.getIn([0, 'money'])}</Description>
              </DescriptionList>
            </Col>
          </Row>
        </Row>
      </Fragment>
    );
  }
}

