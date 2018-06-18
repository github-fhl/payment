import React, { Fragment } from 'react';
import { Modal, Upload, message, Icon } from 'antd';


export default class SignModal extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      previewVisible: false,
      previewImage: '',
      fileList: this.getFileList(props),
      visible: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.$user !== this.props.$user) {
      this.setState({ fileList: this.getFileList(nextProps) });
    }
  }

  onShowModal = (e) => {
    e.preventDefault();
    this.setState({ visible: true });
  };
  onSignOk = () => {
    const { $user } = this.props;
    const params = {
      pathArr: this.state.fileList.map(item => ({ path: item.value || item.response.obj })),
      accountId: $user.get('id'),
    };
    const action = this.props.onOk(params);
    if (action && action.then) {
      action.then(e => {
        if (e.status === 'success') this.setState({ visible: false });
      });
    }
  };

  getFileList = props => props.$user.get('signatures').toArray().map($s => ({
    uid: $s.get('id'),
    id: $s.get('id'),
    status: 'done',
    percent: 100,
    url: `/api/${$s.get('path')}`,
    value: $s.get('path'),
  }));

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  };
  handleSignChange = (file) => this.setState({ fileList: file.fileList });

  render() {
    const { visible, previewVisible, previewImage, fileList } = this.state;

    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    return (
      <Fragment>
        <span onClick={this.onShowModal}>{this.props.children}</span>
        <Modal
          title="签名信息"
          visible={visible}
          onCancel={() => this.setState({ visible: false })}
          maskClosable={false}
          onOk={this.onSignOk}
          width={800}
        >
          <div className="clearfix">
            <Upload
              action="/api/v2/uploadFile"
              listType="picture-card"
              onPreview={this.handlePreview}
              onChange={this.handleSignChange}
              fileList={fileList}
              beforeUpload={(file) => {
                const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
                if (!isJPG) {
                  message.error('只能上传jpg或png文件');
                }
                return isJPG;
              }}
            >
              {fileList.length >= 3 ? null : uploadButton}
            </Upload>
            <Modal visible={previewVisible} footer={null} onCancel={() => this.setState({ previewVisible: false })}>
              <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
          </div>
        </Modal>
      </Fragment>
    );
  }
}
