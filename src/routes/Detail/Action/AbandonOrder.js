import React from 'react';
import { routerRedux } from 'dva/router';
import Immutable from 'immutable';
import { Button } from 'antd';

export default class AbandonOrder extends React.PureComponent {
  static defaultProps = {
    $payment: Immutable.Map(),
  };
  abandonOrder = () => {
    const { dispatch } = this.props;
    const action = new Promise(resolve => dispatch({ type: 'detail/abandonOrder', resolve }));
    action.then(e => {
      if (e.status === 'success') {
        dispatch(routerRedux.push('/my-list'));
      }
    });
  };

  render() {
    return (
      <Button size="large" type="danger" onClick={this.abandonOrder}>
        作废
      </Button>
    );
  }
}
