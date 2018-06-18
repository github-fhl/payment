import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Immutable from 'immutable';
import { Card, Button, Switch, Popconfirm } from 'antd';
import PaymentList from 'components/PaymentList';
import { config, msg } from 'utils';
import { deleteUser, createUser, updateUserRoles, updateSignatures, updateUserInfo } from '../../services/permission';
import CreateModal from './List/CreateModal';
import RolesModal from './List/RolesModal';
import SignModal from './List/SignModal';
import InfoModal from './List/InfoModal';
import styles from './styles.less';


const baseFields = ['name', 'managerUsr', 'directorUsr', 'roles', 'operate'];

@connect(({ permission, loading }) => ({
  $list: permission.$list,
  loading: loading.models.permission,
}))
export default class TableList extends PureComponent {
  state = {
    isFullColumns: false,
    selectedRowKeys: [],
  };

  componentWillMount() {
    this.columns = [
      { dataIndex: 'id', title: '用户名', width: 150 },
      { dataIndex: 'name', title: '姓名', width: 150 },
      { dataIndex: 'department', title: '部门', width: 150 },
      { dataIndex: 'title', title: '职位', width: 150 },
      { dataIndex: 'email', title: '邮箱', width: 240 },
      { dataIndex: 'telephoneNumber', title: '分机号', width: 60 },
      { dataIndex: 'managerUsr', title: '普通主管', width: 150 },
      { dataIndex: 'directorUsr', title: '总监主管', width: 150 },
      {
        dataIndex: 'roles',
        title: '权限',
        width: 300,
        render: (text) => {
          if (Immutable.List.isList(text)) {
            return text.filter($t => $t.get('id') !== config.roles.general).toArray().map(
              $item => {
                const key = $item.get('id');
                return (<div key={key}>{msg.roles[key] || key}</div>);
              },
            );
          }
        },
      },
      {
        dataIndex: 'operate',
        title: '操作',
        width: 180,
        render: (text, $record) => {
          const notAdmin = $record.get('roles') && $record.get('roles').every($item => $item.get('id') !== config.roles.admin);
          return (
            <span className={styles.operate}>
              {
                notAdmin &&
                <RolesModal $user={$record} onOk={this.onUpdateRoles}>权限</RolesModal>
              }
              <SignModal $user={$record} onOk={this.onUpdateSign}>签名</SignModal>
              <InfoModal $user={$record} onOk={this.onUpdateUserInfo}>用户资料</InfoModal>
            </span>
          );
        },
      },
    ];
    this.baseColumns = this.columns.filter(column => baseFields.includes(column.dataIndex));
  }

  componentDidMount() {
    this.onFetch();
  }

  onFetch = params => this.props.dispatch({
    type: 'permission/fetch',
    payload: params,
  });
  onChangeColumns = checked => this.setState({ isFullColumns: checked });
  onDelete = () =>
    deleteUser({ idArr: this.state.selectedRowKeys }).then(e => {
      if (e.status === 'success') {
        this.setState({ selectedRowKeys: [] });
        this.props.dispatch({ type: 'permission/fetch' });
      }
    });
  onCreateUser = params => {
    return createUser(params).then(e => {
      if (e.status === 'success') this.onFetch();
      return e;
    });
  };
  onUpdateRoles = params => {
    return updateUserRoles(params).then(e => {
      if (e.status === 'success') this.onFetch();
      return e;
    });
  };
  onUpdateSign = params => {
    return updateSignatures(params).then(e => {
      if (e.status === 'success') this.onFetch();
      return e;
    });
  };
  onUpdateUserInfo = params => {
    return updateUserInfo(params).then(e => {
      if (e.status === 'success') this.onFetch();
      return e;
    });
  };

  render() {
    const { $list, loading } = this.props;
    const { isFullColumns } = this.state;
    const props = {
      dataSource: $list,
      loading,
      rowSelection: {
        selectedRowKeys: this.state.selectedRowKeys,
        onChange: (selectedRowKeys) => {
          this.setState({ selectedRowKeys });
        },
      },
    };
    return (
      <Card bordered={false}>
        <div className={styles.action}>
          {/* 创建 */}
          <CreateModal onOk={this.onCreateUser}>
            <Button type="primary">创建</Button>
          </CreateModal>

          {/* 删除 */}
          {
            this.state.selectedRowKeys.length > 0 && (
              <Popconfirm title="确认删除吗" onConfirm={this.onDelete}>
                <Button type="danger">删除</Button>
              </Popconfirm>)
          }

          {/* 显示用户资料 */}
          <span style={{ marginLeft: 10 }}>
            用户资料: <Switch checked={isFullColumns} onChange={this.onChangeColumns} />
          </span>
        </div>
        <PaymentList
          {...props}
          rowKey={$record => $record.get('id')}
          columns={isFullColumns ? this.columns : this.baseColumns}
        />
      </Card>
    );
  }
}
