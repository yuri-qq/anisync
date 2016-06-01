init.components.lib.MaxLengthInput = React.createClass({
  displayName: "MaxLengthInput",
  propTypes: {
    hideOnBlur: React.PropTypes.bool.isRequired,
    update: React.PropTypes.func.isRequired,
    handleFocus: React.PropTypes.func.isRequired,
    handleBlur: React.PropTypes.func.isRequired,
    value: React.PropTypes.string.isRequired,
    maxStringLength: React.PropTypes.number.isRequired,
    limitString: React.PropTypes.bool.isRequired,
    negativeMargin: React.PropTypes.bool.isRequired
  },

  getInitialState: function() {
    return {
      hide: this.props.hideOnBlur ? true : false
    };
  },

  handleChange: function(event) {
    this.setState({length: event.target.value.length});
    this.props.update(event.target.value);
  },

  handleFocus: function(event) {
    if(this.props.hideOnBlur) this.setState({hide: false});
    if(this.props.handleFocus) this.props.handleFocus(event);
  },

  handleBlur: function(event) {
    if(this.props.hideOnBlur) this.setState({hide: true});
    if(this.props.handleBlur) this.props.handleBlur(event);
  },

  render: function() {
    var warningClass;
    var length = this.props.value.length;
    var maxStringLength = this.props.maxStringLength;
    var attributes = this.props;
    attributes.maxLength = this.props.limitString ? maxStringLength : "";
    attributes.onChange = this.handleChange;
    attributes.onFocus = this.handleFocus;
    attributes.onBlur = this.handleBlur;

    if(this.props.limitString) {
      warningClass = (length === maxStringLength ? "warning" : "");
    }
    else {
      warningClass = (length > maxStringLength ? "warning" : "");
    }

    return(
      React.createElement("div", {
          className: (this.props.negativeMargin ? "negative-margin" : "")
        },
        React.createElement("input", attributes),
        React.createElement("div", {
          className: "characters-left " + ((length === 0 || this.state.hide) ? "invisible " : "") + warningClass
        }, length + "/" + maxStringLength)
      )
    );
  }
});
