import React from 'react';
import _ from 'lodash';
import { Modal, Button, Select, Icon, DatePicker } from 'antd';
import SimpleReduxForm from 'components/Form/SimpleReduxForm';
import { format } from 'utils';
import { UploadForm } from 'components/FormItem';
import Immutable from 'immutable';


const $initFormValue = Immutable.Map();
export default class NewExpense extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      $value: $initFormValue,
    };
  }

  onOk = () => {
    this.form.validateFields((err) => {
      if (err) return;
      const fields = this.formColumns.map(item => item.dataIndex);
      const { $value } = this.state;
      let params = fields.reduce((v, key) => ({ ...v, [key]: $value.get(key) }), {});
      params.paymentDate = format.date(params.paymentDate);
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
      if (key.includes('filePath')) $value = $value.delete('sheetName');
    }
    this.setState({ $value });
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
    let sheet = [];
    const filePath = $value.get('filePath');
    if (filePath) {
      const sheetList = _.get(filePath, '0.response.sheets');
      if (sheetList) sheet = sheetList;
    }

    // 表单渲染
    this.formColumns = [
      {
        dataIndex: 'paymentDate',
        title: '报销时间',
        option: {
          rules: [{ type: 'object', required: true, message: '请选择时间' }],
        },
        Component: <DatePicker style={{ width: '100%' }} />,
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
          <UploadForm listType="picture" data={{ fileType: 'excel' }}>
            <Button> <Icon type="upload" />点击上传 </Button>
          </UploadForm>),
      },
      {
        dataIndex: 'sheetName',
        title: 'Sheet 名',
        option: {
          rules: [{ required: true, message: '缺少Sheet 名' }],
        },
        Component: (
          <Select>
            {sheet.map(key => <Select.Option key={key}>{key}</Select.Option>)}
          </Select>
        ),
      },
    ];

    return (
      <span>
        <span onClick={this.showModal}>{children}</span>
        <Modal
          maskClosable={false}
          onCancel={() => this.setState({ visible: false })}
          visible={this.state.visible}
          onOk={this.onOk}
          title="导入报销 Excel 文件"
        >
          <SimpleReduxForm
            layout="horizontal"
            $value={$value}
            columns={this.formColumns}
            onValuesChange={this.onValuesChange}
            labelCol={{ span: 5 }}
            wrappedComponentRef={e => this.form = e && e.props.form}
          />
        </Modal>
      </span>
    );
  }
}
