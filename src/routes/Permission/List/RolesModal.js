import React, { Fragment } from 'react';
import { Modal, Checkbox } from 'antd';
import { msg } from 'utils';
import styles from './RolesModal.less';


// 可操作的权限
const operateRoles = ['applicant', 'manager', 'cashier', 'GL', 'InterCompany', 'finance', 'hr', 'chief', 'maintainer'];
// 显示的用户信息
const userFields = ['name', 'department', 'telephoneNumber'];


export default class RolesOperate extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      roles: this.getUserRoles(props),
      visible: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.$user !== this.props.$user) {
      this.setState({ roles: this.getUserRoles(nextProps) });
    }
  }

  onShowModal = (e) => {
    e.preventDefault();
    this.setState({ visible: true, roles: this.getUserRoles(this.props) });
  };

  // 单选框事件
  onRolesChange = field => e => {
    if (e.target.checked) {
      this.setState(prevState => ({ roles: prevState.roles.add(field) }));
    } else {
      this.setState(prevState => ({ roles: prevState.roles.delete(field) }));
    }
  };

  // 确定回调
  onOk = () => {
    const action = this.props.onOk({
      accountId: this.props.$user.get('id'),
      roleIdArr: this.state.roles.toArray(),
    });
    if (action && action.then) {
      action.then(e => {
        if (e.status === 'success') this.setState({ visible: false });
      });
    }
  };
  getUserRoles = props => props.$user.get('roles').map($u => $u.get('id')).toSet();

  render() {
    const { $user } = this.props;
    const { visible } = this.state;

    return (
      <Fragment>
        <span onClick={this.onShowModal}>{this.props.children}</span>
        <Modal
          visible={visible}
          onCancel={() => this.setState({ visible: false })}
          onOk={this.onOk}
          title="权限操作"
        >
          <div className={styles.permissionInfo}>
            {userFields.map(field => (
              <div key={field} className={styles.permissionInfoItem}>
                <span className={styles.title}>{msg.permissionField[field]}</span>
                <span className={styles.value}>{$user.get(field)}</span>
              </div>
            ))}
          </div>
          <div className={styles.permissionRoles}>
            <h3>权限</h3>
            {operateRoles.map(role => {
              return (
                <div key={role} className={styles.permissionRolesItem}>
                  <Checkbox
                    onChange={this.onRolesChange(role)}
                    checked={this.state.roles.includes(role)}
                  >
                    {msg.operateRoles[role]}
                  </Checkbox>
                </div>
              );
            })
            }
          </div>
        </Modal>
      </Fragment>
    );
  }
}
