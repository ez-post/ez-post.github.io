`use strict`

import * as React from 'react';

var styles = require('../../css/components/index');
declare function require(path: string): any;

export class Index extends React.Component<{}, {}> {
  render() {
    return (
      <div className={styles['reacttoolbox']}>
      </div>
    );
  }
}
