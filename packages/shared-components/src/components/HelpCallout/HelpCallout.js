import React from 'react';
import PropTypes from 'prop-types';
import { Manager, Reference, Popper } from 'react-popper';
import P from 'components/P';
import Anchor from 'components/Anchor';
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

  renderTextAsTriggerElement = (ref) => (
    /* TODO: move to the Link when it will be in the master */
    <Anchor
      type="text"
      onMouseOver={this.onMouseOver}
      onMouseLeave={this.onMouseLeave}
    >
      {this.props.children}
      <HelpIcon
        name="help"
        innerRef={ref}
      />
    </Anchor>
  );

  renderIconAsTriggerElement = (ref) => (
    <React.Fragment>
      {this.props.children}
      <HelpIcon
        name="help"
        innerRef={ref}
        onMouseOver={this.onMouseOver}
        onMouseLeave={this.onMouseLeave}
      />
    </React.Fragment>
  );

  renderReferenceContent = ({ ref }) => {
    const renderContent = this.props.hintText
      ? this.renderTextAsTriggerElement
      : this.renderIconAsTriggerElement;
    return renderContent(ref);
  };

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
    const { placement, children } = this.props;
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
