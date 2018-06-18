import React, { Fragment } from 'react';
import { Modal, Select } from 'antd';
import { connect } from 'dva';
import Immutable from 'immutable';
import SimpleReduxForm from 'components/Form/SimpleReduxForm';
import { config } from 'utils';
import { permissionsFields as _perFields } from '../../../common/config';

const Option = Select.Option;
const $initFormValue = Immutable.Map();

// 主管选择框
@connect(({ permission }) => ({
  departments: permission.$list.filter(
    $user => $user.get('roles').some($role => $role.get('id') === config.roles.manager),
  ),
}))
export class DepartmentSelect extends React.PureComponent {
  render() {
    const { departments, ...props } = this.props;
    return (
      <Select {...props}>
        {departments.valueSeq().map($d => {
          return <Option key={$d.get('id')}>{$d.get('name')}</Option>;
        })}
      </Select>
    );
  }
}


export default class UserInfoOperate extends React.PureComponent {
  static defaultProps = {
    systemUser: Immutable.List(),
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      $value: $initFormValue,
    };
  }

  onShowModal = (e) => {
    e.preventDefault();
    this.setState({ visible: true, $value: this.props.$user });
  };

  // 确定回调
  onOk = () => {
    this.form.validateFieldsAndScroll((err) => {
      if (!err) {
        const { $value } = this.state;
        const { $user } = this.props;
        const fields = this.columns.map(item => item.dataIndex);
        let params = fields.reduce((v, key) => ({ ...v, [key]: $value.get(key) }), { id: $user.get('id') });

        const action = this.props.onOk(params);
        if (action && action.then) {
          action.then(e => {
            if (e.status === 'success') this.setState({ visible: false });
          });
        }
      }
    });
  };

  onValuesChange = obj => {
    let $value = this.state.$value;
    for (let key in obj) {
      $value = $value.set(key, obj[key]);
    }
    this.setState({ $value });
  };

  render() {
    const { visible, $value } = this.state;
    const { systemUser } = this.props;
    const departments = systemUser.filter(
      $user => $user.get('roles').some($role => $role.get('id') === 'manager'),
    );
    this.columns = [
      { dataIndex: _perFields.name, title: ' 姓名' },
      { dataIndex: _perFields.department, title: ' 部门' },
      { dataIndex: _perFields.title, title: ' 职位' },
      { dataIndex: _perFields.email, title: ' 邮箱' },
      { dataIndex: _perFields.telephoneNumber, title: ' 分机号' },
      { dataIndex: _perFields.managerUsr, Component: <DepartmentSelect departments={departments} />, title: ' 普通主管' },
      { dataIndex: _perFields.directorUsr, Component: <DepartmentSelect departments={departments} />, title: ' 总监主管' },
    ];
    return (
      <Fragment>
        <span onClick={this.onShowModal}>{this.props.children}</span>
        <Modal
          title="用户资料"
          visible={visible}
          onCancel={() => this.setState({ visible: false })}
          maskClosable={false}
          onOk={this.onOk}
          width={800}
        >
          <div className="user-info-form">
            <SimpleReduxForm
              layout="horizontal"
              $value={$value}
              onValuesChange={this.onValuesChange}
              columns={this.columns}
              labelCol={{ span: 6 }}
              wrappedComponentRef={e => this.form = e && e.props.form}
            />
          </div>
        </Modal>
      </Fragment>
    );
  }
}
