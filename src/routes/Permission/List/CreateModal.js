import React, { Fragment } from 'react';
import { Modal, message, Input, Form, Table } from 'antd';
import Immutable from 'immutable';
import { permissionsFields as _perFields } from '../../../common/config';
import { fetchSystemUser } from '../../../services/permission'; // e.users

const Search = Input.Search;
const FormItem = Form.Item;

@Form.create()
export default class UserInfoOperate extends React.PureComponent {
  static defaultProps = {
    systemUser: Immutable.List(),
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      users: [],
      cn: '',
      selectedUser: [],
      visible: false,
    };

    this.columns = [
      { dataIndex: _perFields.cn, title: '用户名' },
      { dataIndex: _perFields.department, title: '部门' },
      { dataIndex: _perFields.title, title: '职位' },
    ];
  }

  onShowModal = () => {
    this.setState({ visible: true });
  };

  // 确定回调
  onOk = () => {
    const { users, selectedUser } = this.state;
    if (selectedUser.length < 1) return message.error('请选择一个');

    let userArr = [];
    if (selectedUser.length > 0) {
      selectedUser.forEach((i) => {
        if (i !== 'undefined') {
          userArr.push(users[i]);
        }
      });
      const action = this.props.onOk({ accountArr: userArr });
      if (action && action.then) {
        action.then(e => {
          if (e.status === 'success') this.setState({ visible: false });
        });
      }
    }
  };
  search = () => {
    this.setState({ loading: true });
    fetchSystemUser({ cn: this.state.cn }).then(e => {
      this.setState({ loading: false });
      if (e.error) {
        message.error(e.error.message);
      } else {
        this.setState({ users: e.users });
      }
    });
  };
  handleSearch = (v) => {
    if (v.length >= 3) {
      this.setState({ cn: v }, () => this.search());
    } else {
      return false;
    }
  };

  // 搜索验证
  checkSearch = (rule, value, callback) => {
    if (value.length > 2) {
      callback();
      return;
    }
    callback('请填写至少三个字符');
  };

  render() {
    const { visible, loading, users } = this.state;
    const { getFieldDecorator } = this.props.form;
    const selection = {
      selectedRowKeys: this.state.selectedUser,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedUser: selectedRowKeys });
      },

    };

    return (
      <Fragment>
        <span onClick={this.onShowModal}>{this.props.children}</span>
        <Modal
          title="请选择审批管理员"
          visible={visible}
          onCancel={() => this.setState({ visible: false, selectedUser: [] })}
          maskClosable={false}
          onOk={this.onOk}
          width={1000}
        >

          <Form layout="inline">
            <FormItem
              label="关键字"
            >
              {getFieldDecorator('userName', {
                rules: [{ validator: this.checkSearch }],
              })(
                <Search
                  placeholder="请填写员工姓名"
                  style={{ width: 200, display: 'inline-block' }}
                  onSearch={this.handleSearch}
                />,
              )}
            </FormItem>
          </Form>

          <Table
            rowSelection={selection}
            size="small"
            loading={loading}
            columns={this.columns}
            dataSource={users}
            style={{ marginTop: 20 }}
          />
        </Modal>
      </Fragment>
    );
  }
}
