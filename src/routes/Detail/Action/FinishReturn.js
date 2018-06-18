import React, { Fragment } from 'react';
import Immutable from 'immutable';
import { Button, Modal, Input, message } from 'antd';

export default class FinishReturn extends React.PureComponent {
  static defaultProps = {
    $payment: Immutable.Map(),
  };
  state = {
    visible: false,
    rejectRemark: '',
  };
  onInputChange = e => this.setState({ rejectRemark: e.target.value });
  onShowModal = () => this.setState({ visible: true });
  finishReturn = () => {
    const { rejectRemark } = this.state;
    const { dispatch } = this.props;
    if (rejectRemark) {
      const action = new Promise(resolve => dispatch({
        type: 'detail/finishReturn',
        payload: { rejectRemark },
        resolve,
      }));
      action.then(e => {
        if (e.status === 'success') {
          dispatch({ type: 'user/getLog' });
          this.setState({ visible: false });
        }
      });
    } else {
      message.error('请输入备注');
    }
  };

  render() {
    const { rejectRemark, visible } = this.state;
    return (
      <Fragment>
        <Button size="large" type="danger" onClick={this.onShowModal}>
          付款退回
        </Button>
        <Modal
          visible={visible}
          title="付款退回"
          onCancel={() => this.setState({ visible: false })}
          onOk={this.finishReturn}
        >
          <div style={{ marginLeft: 10 }}>
            备注 :
            <Input.TextArea
              placeholder="请输入备注"
              value={rejectRemark}
              onChange={this.onInputChange}
              style={{ marginTop: 10 }}
            />
          </div>
        </Modal>
      </Fragment>
    );
  }
}
