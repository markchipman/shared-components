import React from 'react';
import PropTypes from 'prop-types';
import { Manager, Reference, Popper } from 'react-popper';
import P from 'components/P';
import HelpIcon from './styles/HelpIcon';
import Container from './styles/HelpCalloutContainer';

class HelpCallout extends React.Component {
  static propTypes = {
    /**
     * Where to place the element. Use a value from react-popper
     */
    placement: PropTypes.string,
    /**
     * Content to render inside the callout
     */
    content: PropTypes.node,
    /**
     * Boundary for the callout; either a selector or a DOM element
     */
    boundary: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    /**
     * Maximum width of the callout
     */
    maxWidth: PropTypes.number,
    /**
     * If it true, means that the provided text will be wrapped by link
     * and will trigger the callout show
     */
    hintText: PropTypes.bool,
  };

  static defaultProps = {
    placement: 'top',
    content: '',
    boundary: null,
    maxWidth: 300,
    hintText: false,
  };

  state = {
    showCallout: false,
  };

  onMouseOver = () => {
    this.setState({ showCallout: true });
  };

  onMouseLeave = () => {
    this.setState({ showCallout: false });
  };

  renderReferenceContent = ({ ref }) => (
    <div
      style={{ display: 'inline-block' }}
      ref={ref}
      onMouseOver={this.onMouseOver}
      onMouseLeave={this.onMouseLeave}
    >
      { this.props.children }
      {
        !this.props.withoutIcon && (
          <HelpIcon name="help" />
        )
      }
    </div>
  );

  renderPopperContent = ({ ref, style, placement }) => (
    <Container
      innerRef={ref}
      style={style}
      data-placement={placement}
      maxWidth={this.props.maxWidth}
    >
      {this.props.content}
    </Container>
  );

  getBoundariesElement = () =>
    typeof this.props.boundary === 'string'
      ? document.querySelector(this.props.boundary)
      : this.props.boundary;

  render() {
    const { placement } = this.props;
    const { showCallout } = this.state;

    return (
      <Manager>
        <Reference>{this.renderReferenceContent}</Reference>
        {showCallout && (
          <Popper
            placement={placement}
            positionFixed
            modifiers={{
              preventOverflow: {
                boundariesElement:
                  this.getBoundariesElement() || window.document,
              },
            }}
          >
            {this.renderPopperContent}
          </Popper>
        )}
      </Manager>
    );
  }
}

export default HelpCallout;
