import React from 'react';
import Debounce from 'lodash-decorators/debounce';
import Immutable from 'immutable';
import { Table } from 'antd';
import * as config from '../../utils/config';
import './index.less';

/**
 * 用于列表页面一屏自动延伸表格展示
 * * */

export default class TableList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.isClearFixed = false; // 用来check 是否清楚掉固定column的标记；用来更新强制更新表格；
  }

  componentDidMount() {
    window.addEventListener('resize', this.setHeightWidthResize, false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setHeightWidthResize, false);
  }

  setHeightWidthResize = Debounce(() => {
    this.forceUpdate();
  }, 200);

  checkTableFixed = (columns, tableWarpWidth) => {
    // 获取table的宽度
    // let dom=document.querySelectorAll('.main-table');

    // 如果表格没有滚动条则清除 fixed 属性
    this.isClearFixed = false;
    if (this.table && this.table.clientWidth > tableWarpWidth) {
      return columns.map(column => {
        if (column.fixed) {
          this.isClearFixed = true;
          return { ...column, fixed: false };
        }
        return column;
      });
    }

    // 如果表格有滚动条则保留fixed
    return columns;
  };

  render() {
    let { rowSelection, columns } = this.props;

    // 重新计算表格的宽度
    const initialWidth = rowSelection ? 62 : 0; // 如果有表格前缀多选项 则宽度增加 62（选项宽度）；
    const width = columns.reduce(
      (value, curr) =>
        value + (curr.width ? curr.width : config.tdDefaultWidth),
      initialWidth,
    );
    let scroll = { x: width };
    columns = this.checkTableFixed(columns, width);
    return (
      <div
        className="main-table"
        ref={(c) => {
          this.table = c;
        }}
      >
        <Table
          size="middle"
          bordered
          rowKey={(r, i) => i}
          key={`fixed-table${this.isClearFixed}`}
          scroll={scroll}
          {...this.props}
          columns={columns}
        />
      </div>
    );
  }
}


// 添加选择项，click row 自动选择
export class SmallSelectionTable extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
    };
  }

  onChange = () => {
    const { dataSource, rowSelection } = this.props;
    if (dataSource && rowSelection && rowSelection.onChange) {
      rowSelection.onChange(this.state.selectedRowKeys, this.state.selectedRowKeys.map(index => dataSource[index]));
    }
  };

  render() {
    const props = {

      // 单击行自动选择
      onRowClick: (record, index) => {
        if (this.state.selectedRowKeys.indexOf(index) < 0) {
          if (this.props.rowSelection && this.props.rowSelection.type === 'radio') {
            this.setState({ selectedRowKeys: [index] }, this.onChange);
          } else {
            this.setState({ selectedRowKeys: this.state.selectedRowKeys.concat(index) }, this.onChange);
          }
        }
      },
      ...this.props,
      rowSelection: {
        ...this.props.rowSelection,
        selectedRowKeys: this.state.selectedRowKeys,

        // 单选框改变时自动设置 selectedRowKeys,并回调props onChange
        onChange: (keys) => {
          this.setState({ selectedRowKeys: keys }, this.onChange);
        },
      },
    };
    return <TableList {...props} />;
  }
}

export class TableListImmutable extends React.PureComponent {
  static defaultProps = {
    dataSource: [],
  };

  componentWillMount() {
    this.columns = this.transformColumns(this.props.columns);
    this.transformDataSource(this.props.dataSource);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.columns !== this.props.columns) {
      this.columns = this.transformColumns(nextProps.columns);
    }
    if (nextProps.dataSource !== this.props.dataSource) {
      this.transformDataSource(nextProps.dataSource);
    }
  }

  // 转换 columns
  transformColumns = columns =>
    columns.map(column => {
      // 访问value值的路径
      const path = column.path || [column.dataIndex];
      if (column.render === undefined) {
        column.render = (value, record) => record.getIn(path);
      } else {
        // 如果是含有render 则重写 render text
        const oldRender = column.render;
        column.render = (value, record, index) =>
          oldRender(record.getIn(path), record, index);
      }
      return { ...column };
    });

  // 转换 dataSource
  transformDataSource = dataSource => {
    if (Immutable.Map.isMap(dataSource) || Immutable.List.isList(dataSource)) {
      this.dataSource = dataSource.valueSeq().toArray();
    } else {
      this.dataSource = dataSource;
    }
  };

  render() {
    return (
      <TableList
        {...this.props}
        columns={this.columns}
        dataSource={this.dataSource}
      />
    );
  }
}
