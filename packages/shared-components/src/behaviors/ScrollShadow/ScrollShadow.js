import React, { createContext, createRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import throttle from 'lodash.throttle';
import Sentinel from './Sentinel';
import ShadowOverlay from './ShadowOverlay';
import DefaultContainer from './DefaultContainer';
import DefaultScrollContainer from './DefaultScrollContainer';

const { Provider, Consumer } = createContext(() => () => {});

/**
 * A scrolling container which has a shadow effect to indicate that there is more
 * content above or below. This element also creates a context which can inform
 * components below it in the tree of the scroll state of the scrolling container.
 */
export default class ScrollShadow extends React.Component {
  static propTypes = {
    /**
     * This ScrollShadow should listen to the global window scroll value. Only one
     * such ScrollShadow should be present in your application.
     */
    global: PropTypes.bool,
    /**
     * Customize the outer container element by passing a component here. Your element
     * MUST have relative or absolute positioning applied!
     */
    Container: PropTypes.func,
    /**
     * Customize the scroll container element by passing a component here. Your element
     * MUST have relative or absolute positioning, an overflow mode, and accept an
     * innerRef prop!
     */
    ScrollContainer: PropTypes.func,
    /**
     * Flip this to true to show a red line where the scroll sentinel elements are.
     * Can be useful for debugging if the shadows don't seem to work correctly.
     */
    debugShowSentinels: PropTypes.bool,
  };

  static defaultProps = {
    global: false,
    Container: DefaultContainer,
    ScrollContainer: DefaultScrollContainer,
    debugShowSentinels: false,
  };

  /**
   * A sentinel is an invisible element which is used to track the scroll boundaries.
   * We place them at the top and bottom of the content. When either of them becomes
   * visible, we know that the user has hit that particular scroll boundary.
   */
  topSentinelRef = createRef();
  bottomSentinelRef = createRef();
  /**
   * We are not storing this information in this.state on purpose. We will actually
   * be skipping the React update cycle entirely for changing the shadow styles
   * on the shadow element to avoid unnecessary work for a simple aesthetic change.
   */
  isTopSentinelVisible = true;
  isBottomSentinelVisible = false;

  componentDidMount() {
    if (this.props.global) {
      /**
       * In global mode, the entire window is our scroll context. We can do that by
       * passing 'null' as the context element for the IntersectionObserver.
       * As documented, it will use the visible window area as the intersection
       * boundary.
       */
      this.scrollElementRef(null);
    }
  }

  /**
   * Simply figures out where the shadows should be based on which boundaries
   * are visible right now.
   */
  calcShadowMode = () => {
    const top = !this.isTopSentinelVisible;
    const bottom = !this.isBottomSentinelVisible;

    if (top && bottom) {
      return 'both';
    } else if (top) {
      return 'top';
    } else if (bottom) {
      return 'bottom';
    } else {
      return 'none';
    }
  };

  /**
   * This will be called every time the intersection state of either sentinel changes.
   */
  handleSentinelIntersection = (entries, observer) => {
    // `entries` is an array of records, one per changed sentinel.
    entries.forEach(entry => {
      if (entry.target === this.topSentinelRef.current) {
        this.isTopSentinelVisible = entry.isIntersecting;
      } else if (entry.target === this.bottomSentinelRef.current) {
        this.isBottomSentinelVisible = entry.isIntersecting;
      }

      const currentMode = this.calcShadowMode();

      /**
       * Iterate over every registered shadow element to update their styles
       * if they need to change.
       */
      Object.values(this.shadowElementRegistrations).forEach(registration => {
        const { ref, mode } = registration;
        // we don't want to recalculate styles needlessly, so we also ensure
        // the mode has changed since last style assignment
        if (ref.current && mode !== currentMode) {
          // reset classes
          ref.current.classList.remove('top', 'bottom', 'both');
          ref.current.classList.add(currentMode);
          registration.mode = currentMode;
        }
      });
    });
  };

  scrollElementRef = el => {
    if (this.sentinelIntersectionObserver) {
      this.sentinelIntersectionObserver.disconnect();
    }

    this.sentinelIntersectionObserver = new window.IntersectionObserver(
      this.handleSentinelIntersection,
      {
        root: el,
      },
    );
    this.sentinelIntersectionObserver.observe(this.topSentinelRef.current);
    this.sentinelIntersectionObserver.observe(this.bottomSentinelRef.current);
  };

  /**
   * A map of elements which have registered that they want a shadow applied to them.
   * Elements can register by using the `getShadowElementRef` function we pass through
   * the Context.
   */
  shadowElementRegistrations = {};

  getShadowElementRef = name => {
    if (!this.shadowElementRegistrations[name]) {
      this.shadowElementRegistrations[name] = {
        ref: createRef(),
      };
    }

    return this.shadowElementRegistrations[name].ref;
  };

  renderGlobalSentinels = () =>
    createPortal(
      <React.Fragment>
        <Sentinel
          innerRef={this.topSentinelRef}
          className="scroll-shadow-sentinel top global"
          debugShow={this.props.debugShowSentinels}
        />
        <Sentinel
          innerRef={this.bottomSentinelRef}
          className="scroll-shadow-sentinel bottom global"
          debugShow={this.props.debugShowSentinels}
        />
      </React.Fragment>,
      window.document.body,
    );

  renderChildren = () => {
    const {
      children,
      global,
      Container,
      ScrollContainer,
      disabled,
      outer,
      ...extraProps
    } = this.props;

    // we will be rendering something slightly different if we are in global mode
    if (global) {
      return (
        <React.Fragment>
          {children}
          {this.renderGlobalSentinels()}
          {!disabled && (
            <ShadowOverlay
              className={`scroll-shadow inner`}
              entireViewport
              innerRef={this.getShadowElementRef('built-in')}
            />
          )}
        </React.Fragment>
      );
    }

    const shadowPlacement = outer ? 'outer' : 'inner';

    return (
      <Container className="scroll-shadow-container" {...extraProps}>
        <ScrollContainer innerRef={this.scrollElementRef} {...extraProps}>
          <Sentinel
            innerRef={this.topSentinelRef}
            className="scroll-shadow-sentinel top"
            debugShow={this.props.debugShowSentinels}
          />
          {children}
          <Sentinel
            innerRef={this.bottomSentinelRef}
            className="scroll-shadow-sentinel bottom"
            debugShow={this.props.debugShowSentinels}
          />
        </ScrollContainer>
        {!disabled && (
          <ShadowOverlay
            className={`scroll-shadow ${shadowPlacement}`}
            innerRef={this.getShadowElementRef('built-in')}
          />
        )}
      </Container>
    );
  };

  render() {
    return (
      <Provider value={this.getShadowElementRef}>
        {this.renderChildren()}
      </Provider>
    );
  }
}

/**
 * A ConnectedShadow is a shadow element which gets its shadow mode from
 * a ScrollShadow context higher in the React tree. Using this, you can
 * add some shadows to 'unrelated' elements which respond to the
 * scroll state of the containing scroll element. This is good for
 * advanced use cases, like rendering an element which hovers over
 * a scroll container.
 */
export class ConnectedShadow extends React.PureComponent {
  generatedName = `shadow${Math.floor(Math.random() * 100000)}`;

  render() {
    const {
      outer,
      entireViewport,
      disabled,
      name = this.generatedName,
    } = this.props;

    if (disabled) {
      return null;
    }

    return (
      <Consumer>
        {getShadowElementRef => (
          <ShadowOverlay
            className={`scroll-shadow ${outer ? 'outer' : 'inner'}`}
            entireViewport={entireViewport}
            innerRef={getShadowElementRef(name)}
          />
        )}
      </Consumer>
    );
  }
}

ScrollShadow.ConnectedShadow = ConnectedShadow;
