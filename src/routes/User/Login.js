import React, { Component } from 'react';
import { connect } from 'dva';
import { Alert, Row, Col, Avatar } from 'antd';
import Login from 'components/Login';
import Logo from 'components/Logo';
import styles from './Login.less';

import icon360 from './images/360.jpg';
import iconChrome from './images/chrome.jpg';
import iconFirefox from './images/firefox.jpg';

const { UserName, Password, Submit } = Login;

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
export default class LoginPage extends Component {
  state = {
    type: 'account',
  };

  componentDidMount() {
    // this.props.dispatch({ type: 'login/fetchCurrent' });
  }

  onTabChange = (type) => {
    this.setState({ type });
  };

  handleSubmit = (err, values) => {
    const { type } = this.state;
    if (!err) {
      this.props.dispatch({
        type: 'login/login',
        payload: {
          ...values,
          type,
        },
      });
    }
  };

  renderMessage = (content) => {
    return (
      <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
    );
  };

  render() {
    const { submitting } = this.props;
    const { type } = this.state;
    return (
      <Logo style={{ textAlign: 'center' }}>
        <div className={styles.main}>
          <h2>
            企业账号登录
          </h2>
          <Login
            defaultActiveKey={type}
            onTabChange={this.onTabChange}
            onSubmit={this.handleSubmit}
          >
            <UserName name="id" placeholder="用户名" defaultValue="superMan" />
            <Password name="password" placeholder="密码" defaultValue="123" />
            <Submit loading={submitting}>登录
            </Submit>
            <h4 style={{ marginTop: 40, marginBottom: 15 }}>建议浏览器：</h4>
            <Row style={{ textAlign: 'center', fontSize: 12 }}>
              <Col span={8}>
                <Avatar src={iconChrome} />
                <p>Chrome（推荐）</p>
              </Col>
              <Col span={8}>
                <Avatar src={iconFirefox} />
                <p>Firefox</p>
              </Col>
              <Col span={8}>
                <Avatar src={icon360} />
                <p>360（极速模式）</p>
              </Col>
            </Row>
          </Login>
        </div>
      </Logo>
    );
  }
}
