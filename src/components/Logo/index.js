import React, { Fragment } from 'react';
import styles from './index.less';

class Logo extends React.PureComponent {
  render() {
    return (
      <Fragment>
        <div className={styles.top} style={this.props.style}>
          <div className={styles.header}>
            CHEQUE PAYMENT
            {this.props.extra}
          </div>
        </div>
        {this.props.children}
      </Fragment>
    );
  }
}

export default Logo;
