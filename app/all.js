define(['react', 'tree', 'jquery', 'underscore'], function(React, Tree, $, _) {
    var TreeNode = React.createClass({
      getInitialState: function() {
        return {
          visible: true
        };
      },
      componentDidMount: function() {
          //console.log('mounted', this.props.node.title, this.props.node.selected);
          if (this.props.node.selected) {
            $(this.getDOMNode()).children('h5').children('div').focus();
          }
      },
      componentDidUpdate: function(prevProps, prevState) {
          //console.log('did update', this.props.node.title, this.props.node.selected);
          if (this.props.node.selected) {
            $(this.getDOMNode()).children('h5').children('div').focus();
          }
      },
      render: function() {
        var childNodes;
        var className = "dot";
        if (this.props.node.childNodes != null) {
          childNodes = this.props.node.childNodes.map(function(node, index) {
            return <li key={index}><TreeNode node={node} /></li>
          });

          className = "dot togglable";
          if (this.state.visible) {
            className += " togglable-down";
          } else {
            className += " togglable-up";
          }
        }

        var style = {};
        if (!this.state.visible) {
          style.display = "none";
        }

        return (
          <div>
            <h5>
              <span onClick={this.toggle} className={className}>{String.fromCharCode(8226)}</span>
              <div className="text" onClick={this.textclick} onBlur={this.blur} contentEditable="true">{this.props.node.title}</div>
            </h5>
            <ul style={style}>
              {childNodes}
            </ul>
          </div>
        );
      },
      toggle: function() {
        this.setState({visible: !this.state.visible});
      }
    //  textclick: function() {
    //    console.log('text clicked', this);
    //    this.getDOMNode().contentEditable = true;
    //    this.getDOMNode().focus();
    //  },
    });


    //testSelectNext();
    return TreeNode;
});





























