import React from 'react';
import { connect } from 'dva';
import { Modal, Button, Input, Popconfirm, Radio, Card } from 'antd';
import Immutable from 'immutable';
import { format } from 'utils';
import PaymentList from 'components/PaymentList';
import SimpleReduxForm from 'components/Form/SimpleReduxForm';
import { accountType } from '../../common/config';
import { postSetting, updateSetting, deleteSetting } from '../../services/setting';


const RadioGroup = Radio.Group;
const $initFormValue = Immutable.Map();

@connect(({ setting }) => ({
  account: setting.account,
}))
export default class Account extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      $value: $initFormValue,
    };
  }

  componentDidMount() {
    this.props.dispatch({ type: 'setting/fetchAccount' });
  }

  onValuesChange = obj => {
    let $value = this.state.$value;
    for (let key in obj) {
      $value = $value.set(key, obj[key]);
    }
    this.setState({ $value });
  };
  onOk = () => {
    const submitForm = () => {
      let actionFetch = postSetting.account;
      const fields = this.formColumnsBank.concat(this.formColumns).map(item => item.dataIndex).concat('id');
      const { $value } = this.state;
      let params = fields.reduce((v, key) => ({ ...v, [key]: $value.get(key) }), {});

      if (params.id) actionFetch = updateSetting.account; // 含有 id 为新增
      actionFetch(params).then(e => {
        if (e.status === 'success') {
          this.setState({ visible: false });
          this.props.dispatch({ type: 'setting/fetchAccount' });
        }
      });
    };


    this.form.validateFields((err) => {
      if (this.formDetail) {
        this.formDetail.validateFields((detailErr) => {
          if (!err && !detailErr) submitForm();
        });
      } else if (!err) {
        submitForm();
      }
    });
  };
  onSearch = value => {
    this.setState({ loading: true });
    setTimeout(() => this.setState({ searchTxt: value, loading: false }), 50);
  };

  checkPrice = (rule, value, callback) => {
    if (value && value.length === 2 && !isNaN(value)) {
      callback();
      return;
    }
    callback('类别必须是两位的数字');
  };
  checkCode = (rule, value, callback) => {
    if (value && value.length === 2) {
      callback();
      return;
    }
    callback('代号必须是两位的字符');
  };
  create = () => {
    this.setState({ visible: true, $value: $initFormValue });
  };

  edit = ($record) => {
    this.setState({ visible: true, $value: $record });
  };
  delete = id =>
    deleteSetting.account(id).then(e => {
      if (e.status === 'success') {
        this.props.dispatch({ type: 'setting/fetchAccount' });
      }
    });

  render() {
    const { account } = this.props;
    const { visible, $value, searchTxt, loading } = this.state;
    const nameTitle = '名称';
    const bankFlagTitle = '银行科目';
    // 表格属性

    const columns = [
      { dataIndex: 'name', title: nameTitle },
      { dataIndex: 'code', title: '科目代号' },
      { dataIndex: 'bankNum', title: '银行账号' },
      { dataIndex: 'bankCode', title: '银行代号' },
      { dataIndex: 'accountType', title: '账户类别' },
      { dataIndex: 'bankFlag', title: bankFlagTitle },
      {
        dataIndex: 'createdAt',
        title: '创建日期',
        render: e => format.date(e),
      },
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

    this.formColumns = [
      { dataIndex: 'name',
        title: nameTitle,
        option: {
          rules: [
            { required: true, message: `缺少${nameTitle}` },
          ],
        } },
      { dataIndex: 'code', title: '科目代号' },
      {
        dataIndex: 'bankFlag',
        title: bankFlagTitle,
        option: {
          rules: [
            { required: true, message: `缺少${bankFlagTitle}` },
          ],
        },
        Component: (
          <RadioGroup disabled={!!$value.get('id')}>
            {accountType.map(type => <Radio key={type.value} value={type.value}>{type.title}</Radio>)}
          </RadioGroup>
        ),
      },
    ];


    this.formColumnsBank = [
      { dataIndex: 'bankNum', title: '银行账号' },
      {
        dataIndex: 'accountType',
        title: '账户类别',
        option: { rules: [{ validator: this.checkPrice }] },
      },
      {
        dataIndex: 'bankCode',
        title: '银行代号',
        option: { rules: [{ validator: this.checkCode }] },
      },
    ];
    let $searchAfter = account;
    if (searchTxt) {
      $searchAfter = $searchAfter.filter($item => {
        const reg = new RegExp(searchTxt, 'gi');
        return $item.get('name').match(reg) || $item.get('code').match(reg);
      });
    }

    return (
      <Card bordered={false}>
        <div style={{ marginBottom: 16 }}>
          <Button onClick={this.create} type="primary">创建</Button>
        </div>
        <div style={{ marginBottom: 16 }}>
          <Input.Search placeholder="请输入名称或科目代号" style={{ width: 300 }} onSearch={this.onSearch} />
        </div>
        <PaymentList columns={columns} dataSource={$searchAfter} loading={loading} />
        <Modal
          title="科目管理"
          visible={visible}
          onCancel={() => this.setState({ visible: false })}
          maskClosable={false}
          onOk={this.onOk}
        > <SimpleReduxForm
          layout="horizontal"
          columns={this.formColumns}
          onValuesChange={this.onValuesChange}
          $value={$value}
          labelCol={{ span: 5 }}
          wrappedComponentRef={e => this.form = e && e.props.form}
        /> {
          $value.get('bankFlag') === 'y' && (
            <SimpleReduxForm
              layout="horizontal"
              $value={$value}
              columns={this.formColumnsBank}
              onValuesChange={this.onValuesChange}
              labelCol={{ span: 5 }}
              wrappedComponentRef={e => this.formDetail = e && e.props.form}
            />
          )}
        </Modal>
      </Card>
    );
  }
}

