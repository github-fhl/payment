import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { TableListImmutable } from 'components/TableList';
import styles from './styles.less';

@connect(({ global, routing }, { pagination }) => ({
  pathname: routing.location.pathname,
  pagination: { ...global.pagination, ...pagination },
}))

export default class TableList extends PureComponent {
  render() {
    const { columns = this.columns, ...props } = this.props;
    return (
      <div className={styles.tableList}>
        <TableListImmutable
          columns={columns}
          {...props}
        />
      </div>
    );
  }
}
