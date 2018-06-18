import React from 'react';
import { Row, Col } from 'antd';
import { format } from 'utils';
import Immutable from 'immutable';


export default class ViewPayBank extends React.PureComponent {
  static defaultProps = {
    $payment: Immutable.Map(),
  };

  renderSubject = $item => {
    if (!$item) return null;
    return (
      <Col key={$item.get('id')} style={{ marginTop: 10 }}>
        <span>科目：</span>
        <span>{$item.getIn(['subject', 'name'])}</span>
        <span style={{ marginLeft: 10 }}>金额：</span>
        <span>{format.money($item.get('money'))}</span>
        <span style={{ marginLeft: 10 }}>备注：</span>
        <span>{$item.get('description')}</span>
      </Col>
    );
  };

  render() {
    const { $payment } = this.props;
    const $subject = $payment.get('ordersubjects');
    if (!$subject) return null;
    const $creditSubject = $subject.find($item => $item.get('type') === 'credit');
    const $debitSubject = $subject.filter($item => $item.get('type') === 'debit');

    if (!$creditSubject && !$debitSubject) return null;

    return (
      <Row>
        <Col style={{ fontSize: 16, marginBottom: 10, marginTop: 10 }}>
          <strong>财务科目</strong>
        </Col>
        <Col style={{ color: '#CC3300', fontWeight: 'bold' }}>
          贷方:
        </Col>
        {this.renderSubject($creditSubject)}
        <Col
          style={{
            color: '#108ee9',
            fontWeight: 'bold',
            marginTop: 20,
          }}
        >
          借方
        </Col>
        {$debitSubject.valueSeq().map(this.renderSubject)}
      </Row>
    );
  }
}
