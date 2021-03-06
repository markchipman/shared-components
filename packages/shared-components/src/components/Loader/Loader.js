import React from 'react';
import PropTypes from 'prop-types';
import LoaderRing from './styles/LoaderRing';
import LoaderContainer from './styles/LoaderContainer';

class Loader extends React.PureComponent {
  static propTypes = {
    /**
     * The size of each loader 'dot'. Can be any CSS dimension string.
     */
    size: PropTypes.string,
    /**
     * The color of the loader. Defaults to the primary theme color.
     */
    color: PropTypes.string,
    /**
     * Adds a class name to the element.
     */
    className: PropTypes.string,
    /**
     * Adds an id to the element.
     */
    id: PropTypes.string,
    /**
     * A component for rendering a ring of the loader
     */
    Ring: PropTypes.func,
    /**
     * A component for rendering the containing block of the loader
     */
    Container: PropTypes.func,
  };

  static defaultProps = {
    size: '20px',
    color: null,
    className: null,
    id: null,
    Ring: LoaderRing,
    Container: LoaderContainer,
  };

  render() {
    const { size, color, id, className, Container, Ring } = this.props;

    return (
      <Container id={id} className={className}>
        <Ring size={size} color={color} />
        <Ring size={size} color={color} />
        <Ring size={size} color={color} />
      </Container>
    );
  }
}

export default Loader;
