import React from 'react';
import PropTypes from 'prop-types';
import { MuiThemeProvider } from '@material-ui/core/styles';
import getPageContext from './getPageContext';

function withRoot(Component) {
  class WithRoot extends React.Component {
    pageContext = null;

    constructor(props) {
      super(props);

      this.pageContext = this.props.pageContext || getPageContext();
    }

    componentDidMount() {
      // Remove the server-side injected CSS.
      const jssStyles = document.querySelector('#server-side-jss');
      if (jssStyles && jssStyles.parentNode) {
        jssStyles.parentNode.removeChild(jssStyles);
      }
    }

    render() {
      // MuiThemeProvider makes the theme available down the React tree thanks to React context.
      return (
        <MuiThemeProvider
          theme={this.pageContext.theme}
        >
          <Component {...this.props} />
        </MuiThemeProvider>
      );
    }
  }

  WithRoot.propTypes = {
    pageContext: PropTypes.object,
  };

  return WithRoot;
}

export default withRoot;