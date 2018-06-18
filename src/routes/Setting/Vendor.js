import React from 'react';
import { connect } from 'dva';
import { Modal, Button, Popconfirm, Radio, Card, Input } from 'antd';
import Immutable from 'immutable';
import { format, msg } from 'utils';
import PaymentList from 'components/PaymentList';
import SimpleReduxForm from 'components/Form/SimpleReduxForm';
import VendorFromDetail from './VendorFormDetail';
import { paymentFields as _pay, vendorType } from '../../common/config';
import { postSetting, updateSetting, deleteSetting } from '../../services/setting';
import './Vendor.less';

const RadioGroup = Radio.Group;
const $initFormValue = Immutable.Map();

@connect(({ setting }) => ({
  vendor: setting.vendor,
}))
export default class Vendor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      $value: $initFormValue,
      searchTxt: '',
      loading: false,
    };
  }

  componentWillMount() {
    const vendorName = '名称';
    // 表格属性
    this.columns = [
      { dataIndex: 'name', title: vendorName },
      { dataIndex: 'code', title: 'Code' },
      { dataIndex: 'contacter', title: '联系人' },
      { dataIndex: 'telphone', title: '电话' },
      { dataIndex: 'bankName', title: '银行名称', path: ['vendordetails', 0, 'bankName'] },
      { dataIndex: 'bankNum', title: '银行账户', path: ['vendordetails', 0, 'bankNum'] },
      {
        dataIndex: 'vendorType',
        title: '收款方类别',
        render: text => msg.vendorType[text],
      },
      { dataIndex: 'createdAt', title: '创建日期', render: date => format.date(date) },
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
  }

  componentDidMount() {
    this.props.dispatch({ type: 'setting/fetchVendor' });
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
      let actionFetch = postSetting.vendor;
      const fields = this.formColumns.map(item => item.dataIndex).concat('id');
      const { $value } = this.state;
      const values = $value.toJS();
      let params = fields.reduce((v, key) => ({ ...v, [key]: values[key] }), {});
      params.details = params.vendordetails;
      delete params.vendordetails;

      if (params.id) actionFetch = updateSetting.vendor; // 含有 id 为新增
      actionFetch(params).then(e => {
        if (e.status === 'success') {
          this.setState({ visible: false });
          this.props.dispatch({ type: 'setting/fetchVendor' });
        }
      });
    });
  };
  onSearch = value => {
    this.setState({ loading: true });
    setTimeout(() => this.setState({ searchTxt: value, loading: false }), 50);
  };
  create = () => {
    this.setState({ visible: true, $value: $initFormValue });
  };

  edit = ($record) => this.setState({ visible: true, $value: $record });
  delete = id =>
    deleteSetting.vendor(id).then(e => {
      if (e.status === 'success') {
        this.props.dispatch({ type: 'setting/fetchVendor' });
      }
    });

  render() {
    const { vendor } = this.props;
    const { visible, $value, searchTxt, loading } = this.state;
    const vendorName = '名称';

    // 表单渲染
    const vendorTypeTitle = '收款方类别';
    const detailsTitle = '账户信息';
    const detailsTip = '请输入完整的账户信息';
    let detailsOption = {
      rules: [{
        validator: (rule, value, callback) => {
          if (Immutable.List.isList(value) && value.every(v => v.get(_pay.bankName) && v.get(_pay.bankNum))) {
            callback();
          }
          callback(detailsTip);
        },
      }],
    };
    this.formColumns = [
      { dataIndex: 'name',
        title: vendorName,
        option: {
          rules: [
            { required: true, message: `缺少${vendorName}` },
          ],
        },
      },
      { dataIndex: 'code', title: '操作' },
      { dataIndex: _pay.contacter, title: '联系人' },
      { dataIndex: _pay.telphone, title: '电话' },
      {
        dataIndex: 'vendorType',
        title: vendorTypeTitle,
        option: {
          rules: [
            { required: true, message: `缺少${vendorTypeTitle}` },
          ],
        },
        Component: (
          <RadioGroup>
            {vendorType.map(type => (
              <Radio
                key={type}
                value={type}
              >{msg.vendorType[type]}
              </Radio>
            ))}
          </RadioGroup>
        ),
      },
      {
        dataIndex: 'vendordetails',
        title: detailsTitle,
        wrapperCol: { span: 19 },
        Component: <VendorFromDetail />,
        option: detailsOption,
      },
    ];
    let $searchAfter = vendor;
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
          <Input.Search placeholder="请输入名称或 Code" style={{ width: 300 }} onSearch={this.onSearch} />
        </div>
        <PaymentList columns={this.columns} dataSource={$searchAfter} loading={loading} />
        <Modal
          title="收款方"
          visible={visible}
          onCancel={() => this.setState({ visible: false })}
          maskClosable={false}
          width={700}
          onOk={this.onOk}
        >
          <SimpleReduxForm
            columns={this.formColumns}
            layout="horizontal"
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
