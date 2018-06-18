import React from 'react';
import { connect } from 'dva';
import { Modal, Button, Icon, Input, Popconfirm, Radio, Row, Col, Card } from 'antd';
import Immutable from 'immutable';
import { format, msg } from 'utils';
import { TableListImmutable } from 'components/TableList';
import { AccountSelect, AccountValueToText } from 'components/Setting';
import PaymentList from 'components/PaymentList';
import SimpleReduxForm from 'components/Form/SimpleReduxForm';
import { category } from '../../common/config';
import { postSetting, updateSetting, deleteSetting } from '../../services/setting';

let newData = Immutable.fromJS([{ id: 'new', description: '', operate: 'new' }]);
const RadioGroup = Radio.Group;
const $initFormValue = Immutable.Map();
const $initFormDetail = Immutable.List();

@connect(({ setting }) => ({
  type: setting.type,
}))
export default class Type extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      $value: $initFormValue,
      $detail: $initFormDetail,
      editIndex: -1,
      isCreate: true,
    };
  }

  componentDidMount() {
    this.props.dispatch({ type: 'setting/fetchType' });
  }

  onOk = () => {
    this.form.validateFields((err) => {
      if (err) return;
      let actionFetch = postSetting.type;
      const fields = this.formColumns.map(item => item.dataIndex).concat('id');
      const { $value } = this.state;
      let params = fields.reduce((v, key) => ({ ...v, [key]: $value.get(key) }), {});

      if (!this.state.isCreate) actionFetch = updateSetting.type; // 是否为新增
      params.details = this.state.$detail.toJS() || [];

      actionFetch(params).then(e => {
        if (e.status === 'success') {
          this.setState({ visible: false });
          this.props.dispatch({ type: 'setting/fetchType' });
        }
      });
    });
  };

  onValuesChange = obj => {
    let $value = this.state.$value;
    for (let key in obj) {
      $value = $value.set(key, obj[key]);
      if (key === 'subjectId') {
        newData = newData.setIn([0, 'subjectId'], obj[key]);
      }
    }
    this.setState({ $value });
  };
  addNewData = () => this.setState(prev => ({
    $detail: prev.$detail.concat(newData),
    editIndex: prev.$detail.size,
  }));
  removeData = () => this.setState(
    state => {
      const $detail = state.$detail.delete(state.editIndex);
      const newIndex = state.editIndex - 1;
      return {
        $detail,
        editIndex: newIndex >= 0 ? newIndex : -1,
      };
    });

  addColumnsRender = columns => {
    return columns.map(column => ({
      ...column,
      render: (text, record, index) => {
        if (this.state.editIndex !== index) {
          return column.render ? column.render(text, record, index) : text;
        } else {
          const FormTag = column.Component || Input;
          const formValue = column.getValueFromEvent ? column.getValueFromEvent(text) : text;
          return (
            <FormTag
              {...column.formProps}
              value={formValue}
              placeholder={column.title}
              onChange={
                e => {
                  let value = e && e.target ? e.target.value : e;
                  if (column.getValueFromTag) {
                    value = column.getValueFromTag(value);
                  }
                  let newDateSource = this.state.$detail.update(index, $p => ($p.has('operate') ? $p.set(column.dataIndex, value) : $p.set(column.dataIndex, value).set('operate', 'update')));
                  this.setState({ $detail: newDateSource });
                }
              }
            />
          );
        }
      },
    }));
  };

  create = () => {
    this.setState({ visible: true, $value: $initFormValue, $detail: $initFormDetail, isCreate: true });
  };

  edit = ($record) => {
    this.setState({ visible: true, $value: $record, $detail: $record.get('paytypedetails'), isCreate: false });
  };
  delete = id =>
    deleteSetting.type(id).then(e => {
      if (e.status === 'success') {
        this.props.dispatch({ type: 'setting/fetchType' });
      }
    });
  cancer = () => this.setState({ editIndex: -1, visible: false });

  render() {
    const { type } = this.props;
    const { visible, editIndex, $detail, $value, isCreate } = this.state;


    // 表格属性
    const nameTitle = '名称';
    const descriptionTitle = '描述';
    const categoryTitle = '类别';
    const columns = [
      { dataIndex: 'id', title: nameTitle },
      { dataIndex: 'description', title: descriptionTitle },
      { dataIndex: 'category', title: categoryTitle, render: e => msg.paytypeId[e] },
      {
        dataIndex: 'createdAt',
        title: '创建日期',
        render: e => format.date(e),
      },
      { dataIndex: 'subjectId', title: '科目类别', render: (t) => <AccountValueToText value={t} /> },
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
    const accountSelectProps = {
      style: { width: '100%' },
      filterAction: $list => $list.filter($item => $item.get('bankFlag') === 'n'),
      filterOption: (input, option) => option.props.children.includes(input),
    };
    this.formColumns = [
      {
        dataIndex: 'id',
        title: nameTitle,
        option: {
          rules: [
            { required: true, message: `缺少${nameTitle}` },
          ],
        },
        Component: <Input disabled={!isCreate} />,
      },
      { dataIndex: 'description', title: descriptionTitle, Component: <Input.TextArea /> },
      {
        dataIndex: 'subjectId',
        title: '科目',
        Component: (
          <AccountSelect
            disabled={$detail.size > 0}
            {...accountSelectProps}
          />),
      },
      {
        dataIndex: 'category',
        title: categoryTitle,
        option: {
          rules: [
            { required: true, message: `缺少${categoryTitle}` },
          ],
        },
        Component: (
          <RadioGroup disabled={!isCreate}>
            {Object.keys(category).map(typeItem => (
              <Radio
                key={typeItem}
                value={typeItem}
              >{msg.paytypeId[typeItem]}
              </Radio>
            ))}
          </RadioGroup>),
      },
    ];

    this.detailColumns = [
      { dataIndex: 'id', title: 'id', width: 80 },
      { dataIndex: 'description', title: '描述', width: 120 },
      {
        dataIndex: 'subjectId',
        title: '科目',
        render: (t) => <AccountValueToText value={t} />,
        Component: AccountSelect,
        width: 150,
        formProps: accountSelectProps,
      },
    ];
    return (
      <Card bordered={false}>

        <div style={{ marginBottom: 16 }}>
          <Button onClick={this.create} type="primary">创建</Button>
        </div>
        <PaymentList columns={columns} dataSource={type} />
        <Modal
          title="付款类型"
          visible={visible}
          onCancel={this.cancer}
          maskClosable={false}
          onOk={this.onOk}
          width={800}
        >
          <SimpleReduxForm
            $value={$value}
            layout="horizontal"
            columns={this.formColumns}
            onValuesChange={this.onValuesChange}
            labelCol={{ span: 5 }}
            wrappedComponentRef={e => this.form = e && e.props.form}
          />
          <TableListImmutable
            style={{ marginTop: 20 }}
            pagination={false}
            columns={this.addColumnsRender(this.detailColumns)}
            dataSource={$detail}
            onRow={($record, index) => ({
              onClick: () => this.setState({ editIndex: index }),
            })}
            rowClassName={(e, index) => (index === this.state.editIndex ? 'editRow' : '')}
            footer={() => (
              <Row type="flex" justify="space-between">
                <Col>
                  <Button onClick={this.addNewData}><Icon type="plus" />增加</Button>
                  <Button
                    onClick={this.removeData}
                    style={{ marginLeft: 5 }}
                    disabled={editIndex === -1 || editIndex >= $detail.size}
                  >
                    <Icon type="minus" />删除
                  </Button>
                </Col>
              </Row>
            )}
          />
        </Modal>
      </Card>
    );
  }
}
