import React from 'react';
import { Modal, Button, Icon, Radio } from 'antd';
import SimpleReduxForm from 'components/Form/SimpleReduxForm';
import { downloadUrl, config, msg } from 'utils';
import { UploadForm } from 'components/FormItem';
import Immutable from 'immutable';

const RadioGroup = Radio.Group;
const $initFormValue = Immutable.Map();
export default class ImportPayment extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      $value: $initFormValue,
    };

    // 表单渲染
    this.formColumns = [
      {
        dataIndex: 'type',
        title: '类别',
        option: {
          rules: [{ required: true, message: '请选择类别' }],
        },
        Component: (
          <RadioGroup>
            <Radio value={config.vendorType.company}>{msg.vendorType[config.vendorType.company]}</Radio>
            <Radio value={config.vendorType.user}>{msg.vendorType[config.vendorType.user]}</Radio>
          </RadioGroup>),
      },
      {
        dataIndex: 'filePath',
        title: '文件上传',
        option: {
          initialValue: [],
          valuePropName: 'fileList',
          getValueFromEvent: this.normFile,
          rules: [{ type: 'array', required: true, message: '请上传文件' }],
        },
        Component: (
          <UploadForm listType="picture"> <Button> <Icon type="upload" />点击上传 </Button> </UploadForm>),
      },
    ];
  }

  onOk = () => {
    this.form.validateFields((err) => {
      if (err) return;
      const fields = this.formColumns.map(item => item.dataIndex);
      const { $value } = this.state;
      let params = fields.reduce((v, key) => ({ ...v, [key]: $value.get(key) }), {});
      params.filePath = params.filePath && params.filePath[0].response.obj;
      const saveAction = this.props.onSave(params);
      if (saveAction && saveAction.then) {
        saveAction.then(e => {
          if (e.status === 'success') this.setState({ visible: false });
        });
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
  getTemp = (e) => {
    e.preventDefault();
    downloadUrl('/api/download/temp/Payment.xlsx');
  };
  normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList.slice(-1);
  };

  showModal = () => this.setState({ visible: true });

  render() {
    const { children } = this.props;
    const { $value } = this.state;
    return (
      <span>
        <span onClick={this.showModal}>{children}</span>
        <Modal
          maskClosable={false}
          onCancel={() => this.setState({ visible: false })}
          visible={this.state.visible}
          onOk={this.onOk}
          title="导入申请单 Excel 文件"
        >
          <SimpleReduxForm
            layout="horizontal"
            $value={$value}
            columns={this.formColumns}
            onValuesChange={this.onValuesChange}
            labelCol={{ span: 5 }}
            wrappedComponentRef={e => this.form = e && e.props.form}
          />
          <a style={{ marginLeft: 10 }} onClick={this.getTemp}>下载导入模板</a>
        </Modal>
      </span>
    );
  }
}
