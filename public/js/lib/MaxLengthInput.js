// This file is part of anisync.
// Copyright (C) 2020 Jannes Grzebien
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
