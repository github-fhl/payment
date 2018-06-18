import React from 'react';
import { connect } from 'dva';
import { Modal, Button, Icon, Tooltip, Popconfirm, Card } from 'antd';

import { UploadForm } from 'components/FormItem';
import PaymentList from 'components/PaymentList';
import SimpleReduxForm from 'components/Form/SimpleReduxForm';
import Immutable from 'immutable';
import {
  postSetting,
  updateSetting,
  deleteSetting,
} from '../../services/setting';
import styles from './Company.less';

const $initFormValue = Immutable.Map();

@connect(({ setting }) => ({
  company: setting.company,
}))

export default class Company extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      $value: $initFormValue,
    };
  }

  componentDidMount() {
    this.props.dispatch({ type: 'setting/fetchCompany' });
  }

  onValuesChange = obj => {
    let $value = this.state.$value;
    for (let key in obj) {
      $value = $value.set(key, obj[key]);
    }
    this.setState({ $value });
  };
  onOk = () => {
    this.form.validateFields((err) => {
      if (err) return;
      let actionFetch = postSetting.company;
      const fields = ['id', 'name', 'code', 'logoPath'];
      const { $value } = this.state;
      const params = fields.reduce((v, key) => {
        let value = $value.get(key);
        if (value) {
          // 转换 上传组件的值
          if (Array.isArray(value) && value[0]) {
            value = value[0].url || value[0].response.obj;
          }
          v[key] = value;
        }
        return v;
      }, {});

      if (params.id) actionFetch = updateSetting.company; // 含有 id 为新增
      actionFetch(params).then(e => {
        if (e.status === 'success') {
          this.setState({ visible: false });
          this.props.dispatch({ type: 'setting/fetchCompany' });
        }
      });
    });
  };
  create = () => {
    this.setState({ visible: true, $value: $initFormValue });
  };

  edit = ($record) => {
    $record = $record.update('logoPath', url => (url ? [{
      uid: -1,
      status: 'done',
      url,
      thumbUrl: `/api/upload/${url}`,
    }] : []));
    this.setState({ visible: true, $value: $record });
  };
  delete = id =>
    deleteSetting.company(id).then(e => {
      if (e.status === 'success') {
        this.props.dispatch({ type: 'setting/fetchCompany' });
      }
    });
  normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList.slice(-1);
  };

  render() {
    const { company } = this.props;
    const { visible, $value } = this.state;

    // 表格属性
    const columns = [
      { dataIndex: 'name', title: '名称' },
      {
        dataIndex: 'logoPath',
        title: 'Logo',
        render: url => url && (
          <Tooltip
            title={(
              <span className={styles.imgBox}>
                <img src={`/api/upload/${url}`} alt="logo" />
              </span>
            )}
          >
            <span className="highlight">查看</span>
          </Tooltip>
        ),
      },
      { dataIndex: 'code', title: '公司代号' },
      {
        dataIndex: 'operate',
        title: '操作',
        render: (text, $record) => {
          return (
            <span className="operate">
              <a onClick={() => this.edit($record)}>编辑</a> |
              <Popconfirm
                title="确认删除吗"
                onConfirm={() => this.delete($record.get('id'))}
              >
                <a>删除</a>
              </Popconfirm>
            </span>
          );
        },
      },
    ];

    // 表单渲染
    const formColumns = [
      {
        dataIndex: 'name',
        title: '名称',
        option: {
          rules: [
            { required: true, message: '缺少名称' },
          ],
        },
      },
      { dataIndex: 'code', title: 'Code' },
      {
        dataIndex: 'logoPath',
        title: 'Logo',
        option: {
          valuePropName: 'fileList',
          getValueFromEvent: this.normFile,
        },
        Component: (
          <UploadForm name="file" listType="picture"> <Button> <Icon type="upload" />点击上传 </Button> </UploadForm>),
      },
    ];
    return (
      <Card bordered={false}>
        <div style={{ marginBottom: 16 }}>
          <Button onClick={this.create} type="primary">创建</Button>
        </div>
        <PaymentList columns={columns} dataSource={company} />
        <Modal
          title="付款公司"
          visible={visible}
          onCancel={() => this.setState({ visible: false })}
          maskClosable={false}
          onOk={this.onOk}
        > <SimpleReduxForm
          layout="horizontal"
          columns={formColumns}
          onValuesChange={this.onValuesChange}
          $value={$value}
          labelCol={{ span: 5 }}
          wrappedComponentRef={e => this.form = e && e.props.form}
        />
        </Modal>
      </Card>
    );
  }
}

