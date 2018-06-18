import React from 'react';
import { Modal, Button, Icon, Card, Popconfirm, Timeline, Badge } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import Immutable from 'immutable';
import PaymentList from 'components/PaymentList';
import { DefaultSelect, TripleTypeCascader } from 'components/Setting';
import SimpleReduxForm from 'components/Form/SimpleReduxForm';
import { format, config, getPayType } from 'utils';
import Authorized from 'utils/Authorized';
import { settingDefault } from '../../common/config';
import { formatDefaultDetail, formatDetails } from '../../utils/formatData';
import { postSetting, updateSetting, deleteSetting, fetchDefaultDetails } from '../../services/setting';
import PayeeForm from './DefaultFormDetil';
import styles from './Default.less';

const formType = {
  newName: 'newName',
  newMoney: 'newMoney',
  editName: 'editName',
  editMoney: 'editMoney',
};

const detailRequired = ['validDate', 'money', 'vendordetailId']; // detail 预设对象表单字段

const $initFormValue = Immutable.Map();


@connect(({ setting, user }) => ({
  $default: setting.default,
  $type: setting.type,
  user,
}))
export default class Default extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      $value: $initFormValue,
    };
  }

  componentWillMount() {
    this.formType = formType.newMoney; // 表单类型

    // 字段title
    const nameTitle = '成本中心';
    const vendorNameTitle = '收款方';
    const bankNumTitle = '账户';
    const bankNameTitle = '银行名称';
    const paytypeIdTitle = '类别';
    const moneyTitle = '限额';
    const validDateTitle = '生效日期';

    // redux format to table dataSource
    this.formatDataSource(this.props);
    const renderFields = (field, formatValue) => (text, $record) => {
      let $list = $record.get('details');
      let fieldList = typeof field === 'string' ? [field] : field;
      if ($list && $list.size > 0) {
        const list = $list.valueSeq().map(($item, index) => {
          const valueList = fieldList.map(key => $item.get(key)).filter(e => e).join(' / ');
          return (
            <div className="table-inner-td" key={`${field}-${index}${$item.get(field)}`}>
              {formatValue ? formatValue(valueList) : valueList}
            </div>
          );
        });
        return <div className="table-inner-tr">{list}</div>;
      }
    };

    const buildEditAmount = $record => (paytypeId) => {
      return (
        <span className={styles.operate}>
          {/* 编辑名称 */}
          <Authorized authority={['hr', 'admin']}>
            <a
              onClick={e => {
                e.preventDefault();
                this.formType = formType.editName;
                this.setState({ visible: true, $value: $record });
              }}
            >
             更新
            </a>
          </Authorized>
          {/* 编辑金额 */}
          <Authorized authority={['finance', 'admin']}>
            <a onClick={() => this.edit($record, paytypeId)}>编辑</a>
          </Authorized>
          {/* 删除按钮 */}
          <Authorized authority={['finance', 'admin']}>
            <Popconfirm
              title="确认删除吗？"
              onConfirm={() => deleteSetting.default($record.get('id'))}
            > <a>删除</a>
            </Popconfirm>
          </Authorized>
        </span>
      );
    };
    const getPaytypeCategory = id => {
      const $type = this.props.$type;
      const $targetItem = $type.find($item => $item.get('id') === id);
      return $targetItem ? $targetItem.get('category') : '';
    };

    // Table columns
    this.columns = [
      { dataIndex: 'name', title: nameTitle },
      {
        dataIndex: 'paytypeId',
        title: paytypeIdTitle,
        className: 'full-td',
        render: renderFields(['paytypeId', config.paymentFields.paytypedetailId]),
      },
      {
        dataIndex: 'money',
        title: moneyTitle,
        className: 'full-td tar',
        render: renderFields('money', format.money),
      },
      {
        dataIndex: 'validDate',
        title: validDateTitle,
        className: 'full-td',
        render: renderFields('validDate', value => {
          if (value) {
            return (moment().isAfter(value) ?
              <span><Badge status="success" />{format.date(value)}</span> :
              <span><Badge status="error" />{format.date(value)}</span>);
          } else {
            return value;
          }
        }),
      },
      { dataIndex: 'vendorName', title: vendorNameTitle, className: 'full-td', render: renderFields('vendorName') },
      { dataIndex: 'bankNum', title: bankNumTitle, className: 'full-td', render: renderFields('bankNum') },
      { dataIndex: 'bankName', title: bankNameTitle, className: 'full-td', render: renderFields('bankName') },
      {
        dataIndex: 'operate',
        title: '操作',
        width: 140,
        className: 'full-td',
        render: (text, $record) => {
          const name = $record.get('name');
          if (name === config.specialDefault.others || name === config.specialDefault.publicCost) {
            return null;
          }
          let $list = $record.get('details');
          if ($list && $list.size > 0) {
            const list = $list.valueSeq().map(($item, index) => (
              <div className="table-inner-td" key={`${index}${$item.get('paytypeId')}`}>
                {buildEditAmount($record)([
                  getPaytypeCategory($item.get(config.paymentFields.paytypeId)),
                  $item.get(config.paymentFields.paytypeId),
                  $item.get(config.paymentFields.paytypedetailId),
                ].filter(e => e))}
              </div>
            ));
            return <div className="table-inner-tr">{list}</div>;
          } else {
            return (
              <div className="table-inner-tr">
                <div className="table-inner-td">{buildEditAmount($record)()}</div>
              </div>);
          }
        },
      },
    ];

    // 新建付款对象 表单
    const editNameForm = [
      { dataIndex: 'name',
        title: nameTitle,
        option: {
          rules: [
            { required: true, message: `缺少${nameTitle}` },
          ],
        } },
    ];

    // 编辑预设费用 表单
    const detailRequiredOption = {
      rules: [
        {
          required: true, message: '缺少预设费用',
        },
        {
          validator: (rule, value, callback) => {
            return (
              value && detailRequired.every(key =>
                value.get(key) !== undefined &&
                value.get(key) !== null &&
                value.get(key) !== '') ?
                callback() :
                callback('请将信息填写完整')
            );
          },
        }],
    };
    const detailFullOption = {
      rules: [{
        validator: (rule, value, callback) => {
          if (value !== undefined) {
            const hasValue = detailRequired.every(key =>
              value.get(key) !== undefined &&
              value.get(key) !== null &&
              value.get(key) !== '');
            if (!hasValue) {
              return callback('请将信息填写完整');
            }
          }
          callback();
        },
      }],
    };

    const fieldId = {
      dataIndex: 'id',
      title: nameTitle,
      option: {
        rules: [
          { required: true, message: `缺少${nameTitle}` },
        ],
      },
      Component: <DefaultSelect />,
    };
    const fieldPaytypeId = {
      dataIndex: 'paytypeId',
      title: paytypeIdTitle,
      option: { rules: [{ required: true, message: '请输入类别', type: 'array' }] },
      Component: <TripleTypeCascader />,
    };
    const fieldFuture = {
      dataIndex: 'future',
      title: '计划预设费用',
      wrapperCol: { span: 21 },
      labelCol: { span: 3 },
      option: detailFullOption,
      Component: <PayeeForm type="future" />,
    };
    const editMoneyForm = [
      {
        dataIndex: 'id',
        title: nameTitle,
        option: {
          rules: [
            { required: true, message: `缺少${nameTitle}` },
          ],
        },
        Component: <DefaultSelect disabled />,
      },
      { ...fieldPaytypeId, Component: <TripleTypeCascader disabled /> },
      {
        dataIndex: 'current',
        title: '生效预设费用',
        wrapperCol: { span: 21 },
        labelCol: { span: 3 },
        option: detailFullOption,
        Component: <PayeeForm type="current" disabled />,
      },
      fieldFuture,
    ];
    const newMoneyForm = [
      fieldId,
      fieldPaytypeId,
      {
        dataIndex: 'current',
        title: '预设费用',
        wrapperCol: { span: 21 },
        labelCol: { span: 3 },
        option: detailRequiredOption,
        Component: <PayeeForm type="current" />,
      },
    ];
    this.formColumns = {
      [formType.newName]: editNameForm,
      [formType.editName]: editNameForm,
      [formType.newMoney]: newMoneyForm,
      [formType.editMoney]: editMoneyForm,
    };
  }

  componentDidMount() {
    this.props.dispatch({ type: 'setting/fetchDefault' });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.default !== nextProps.default) {
      this.formatDataSource(nextProps);
    }
  }

  onOk = () => {
    this.form.validateFields((err) => {
      if (err) return;
      const { $value } = this.state;
      let actionFetch = null;
      const getDetail = (list = ['current', 'future']) => list.map(key => $value.get(key)).filter(e => e).map($item => $item.toJS());
      if (this.formType === formType.newName) {
        actionFetch = postSetting.default({ name: $value.get('name') });
      } else if (this.formType === formType.editName) {
        actionFetch = updateSetting.default({ name: $value.get('name'), id: $value.get('id') });
      } else {
        let values = {
          ...getPayType($value.get('paytypeId')),
          reimuserId: $value.get('id'),
          details: getDetail(),
        };
        if (this.formType === formType.newMoney) {
          actionFetch = postSetting.defaultDetails(values);
        } else if (this.formType === formType.editMoney) {
          actionFetch = postSetting.defaultDetails({ ...values, details: getDetail(['future']) });
        }
      }
      if (actionFetch.then) {
        actionFetch.then(e => {
          if (e.status === 'success') {
            this.props.dispatch({ type: 'setting/fetchDefault' });
            this.setState({ visible: false });
          }
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
  getHistory = $history => {
    let historyList = [
      <Timeline.Item key="header" dot={<Icon type="clock-circle-o" style={{ fontSize: '16px' }} />} color="#e9e9e9">
        <span style={{ fontWeight: 'bold' }}>往期预设费用</span>
      </Timeline.Item>,
    ];
    $history.forEach(($historyItem, i) => {
      // check 是否显示全部数据
      if (i > 2 && !this.timelineMore) {
        return false;
      }

      historyList.push(
        <Timeline.Item key={`history${i}`}>
          {`${'生效日期'}:${$historyItem.get('validDate')} |  ${'限额'}:`} {format.money($historyItem)}
        </Timeline.Item>,
      );
    });
    return historyList;
  };
  getTimelineMore = $history => {
    let moreNode = false;
    if ($history.size > 3) {
      if (this.timelineMore) {
        moreNode = (
          <a
            onClick={e => {
              e.preventDefault();
              this.timelineMore = false;
              this.forceUpdate();
            }}
          >{'收起更多'}
          </a>
        );
      } else {
        moreNode = (
          <a
            onClick={e => {
              e.preventDefault();
              this.timelineMore = true;
              this.forceUpdate();
            }}
          >{'查看更多'}
          </a>
        );
      }
    }
    return moreNode;
  };

  create = type => {
    this.formType = type;
    this.setState({ visible: true, $value: $initFormValue });
  };
  formatDataSource = (props) => {
    this.$default = formatDetails()(props.default).filter($d => $d.get('name') !== settingDefault.publicCost);
  };

  edit = ($record, paytypeId) => {
    this.formType = formType.editMoney;
    this.setState({ visible: true, $value: $record });
    const payType = getPayType(paytypeId);
    const params = { id: $record.get('id'), ...payType };

    fetchDefaultDetails(params)
      .then(response => {
        const formatData = formatDefaultDetail(response);
        this.setState({ $value: $record.merge(formatData).set('paytypeId', paytypeId) });
      });
  };
  delete = id =>
    deleteSetting.default(id).then(e => {
      if (e.status === 'success') {
        this.props.dispatch({ type: 'setting/fetchDefault' });
      }
    });

  render() {
    const { visible, $value } = this.state;
    const { $default } = this.props;
    return (
      <Card bordered={false}>
        <div className={styles.topAction}>
          <Authorized authority={['hr', 'admin']}>
            <Button type="primary" onClick={() => this.create('newName')}>创建成本中心</Button>
          </Authorized>
          <Authorized authority={['finance', 'admin']}>
            <Button type="primary" onClick={() => this.create('newMoney')}>创建预设费用</Button>
          </Authorized>
        </div>
        <PaymentList columns={this.columns} dataSource={$default} />
        <Modal
          title="预设费用"
          visible={visible}
          onCancel={() => this.setState({ visible: false })}
          maskClosable={false}
          onOk={this.onOk}
          width={860}
        >
          <SimpleReduxForm
            layout="horizontal"
            onValuesChange={this.onValuesChange}
            key={this.formType}
            columns={this.formColumns[this.formType]}
            $value={$value}
            labelCol={{ span: 5 }}
            wrappedComponentRef={e => this.form = e && e.props.form}
          /> {
          /* 往期预设费用 */
          $value && Immutable.List.isList($value.get('history')) && $value.get('history') > 0 && (
            <Timeline
              style={{ borderTop: '#e9e9e9 solid 1px', paddingTop: 20 }}
              pending={this.getTimelineMore($value.get('history'))}
            >
              {this.getHistory($value.get('history'))}
            </Timeline>
          )}
        </Modal>
      </Card>
    );
  }
}

