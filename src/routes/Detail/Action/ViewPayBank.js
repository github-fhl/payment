import React from 'react';
import Immutable from 'immutable';

export default class ViewPayBank extends React.PureComponent {
  static defaultProps = {
    $payment: Immutable.Map(),
  };

  render() {
    const { $payment } = this.props;
    const $subject = $payment.get('ordersubjects');
    const $creditSubject = $subject && $subject.find($item => $item.get('type') === 'credit');
    if (!$creditSubject) return null;

    return (
      <div style={{ marginTop: 10, marginBottom: 10 }}>
        <strong>付款银行 : </strong>
        {$creditSubject.getIn(['subject', 'code'])},
        {$creditSubject.getIn(['subject', 'name'])}
        <span style={{ marginLeft: 20 }}>
          <strong>银行账号 : </strong>{$creditSubject.getIn(['subject', 'bankNum'])}
        </span>
      </div>
    );
  }
}
