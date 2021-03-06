import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Input from 'components/Input';
import RadioGroup from 'components/RadioGroup';
const RadioButton = RadioGroup.Button;
import moment from 'moment';
import TimeContainer from './styles/TimeContainer';
import TimeRadioContainer from './styles/TimeRadioContainer';
import InternalTimePicker from './InternalTimePicker';

class TimePicker extends React.PureComponent {
  static propTypes = {
    /**
     * The current time value of the widget. The value should be a moment object or a unix time.
     * If value is not passed, the component will control its own time.
     */
    value: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    /**
     * Time format to pass to moment to format the string. Probably hh:mm or HH:mm for 24 hour time
     */
    timeFormat: PropTypes.string,
    /**
     * Should the time input be disabled?
     */
    disabled: PropTypes.bool,
  };

  static defaultProps = {
    value: undefined,
    timeFormat: 'hh:mm',
    disabled: false,
  };

  state = {
    internalValue: undefined,
  };

  get twentyFourHour() {
    return /[Hk]/g.test(this.props.timeFormat);
  }

  handleOnChange = ({ value, amSelected }) => {
    if (!value) {
      return;
    }
    const timeValue = moment(value, this.props.timeFormat);
    const timeValueIsAm = timeValue.hours() < 12;
    let sign = 0;
    if (!this.twentyFourHour && amSelected !== timeValueIsAm)
      sign = amSelected ? -1 : 1;
    const newValue = timeValue.add(sign * 12, 'hours');
    this.setState({ internalValue: newValue });
    this.props.onChange(newValue);
  };

  handleTimeChange = date =>
    this.handleOnChange({ value: date, amSelected: this.isAm });

  handleAmPm = amSelected => ev =>
    this.handleOnChange({ value: this.momentValue, amSelected });

  get value() {
    return this.props.value ? this.props.value : this.state.internalValue;
  }

  get momentValue() {
    return moment(this.value);
  }

  get isAm() {
    return this.momentValue.hours() <= 11;
  }

  render() {
    const { name, disabled } = this.props;
    return (
      <TimeContainer>
        <InternalTimePicker
          disabled={disabled}
          onChange={this.handleTimeChange}
          value={this.momentValue.format(this.props.timeFormat)}
        />
        {!this.twentyFourHour && (
          <TimeRadioContainer>
            <RadioButton.Small
              onChange={this.handleAmPm(true)}
              checked={this.isAm}
              name={`${name}-ampm`}
              value="am"
              label="AM"
            />
            <RadioButton.Small
              onChange={this.handleAmPm(false)}
              checked={!this.isAm}
              name={`${name}-ampm`}
              value="pm"
              label="PM"
            />
          </TimeRadioContainer>
        )}
      </TimeContainer>
    );
  }
}

export default TimePicker;
