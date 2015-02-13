define(['react', 'tree', 'jquery', 'underscore'], function(React, Tree, $, _) {
    var setCursorLoc = function(contentEditableElement, caretLoc) {
        var range,selection;
        if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
        {
            range = document.createRange();//Create a range (a range is a like the selection but invisible)
            //console.log(contentEditableElement, 'area');
            range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
            if (contentEditableElement.innerHTML.length > 0) {
                range.setStart(contentEditableElement.childNodes[0], caretLoc);
            }
            range.collapse(true);//collapse the range to the end point. false means collapse to end rather than the start
            selection = window.getSelection();//get the selection object (allows you to change selection)
            selection.removeAllRanges();//remove any selections already made
            selection.addRange(range);//make the range you have just created the visible selection
        }
        else if(document.selection)//IE 8 and lower
        { 
            range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
            range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
            range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
            range.select();//Select the range (make it the visible selection
        }
    };
    var TreeNode = React.createClass({
      getInitialState: function() {
        return {
          visible: true
        };
      },
      componentDidMount: function() {
          //console.log('mounted', this.props.node.title, this.props.node.selected);
          if (this.props.node.selected) {
            var el = $(this.getDOMNode()).children('h5').children('div');
            el.focus();
            //console.log('hi there', this.props.node);
            setCursorLoc(el.get(0), this.props.node.caretLoc);
          }
      },
      componentDidUpdate: function(prevProps, prevState) {
          //console.log('did update', this.props.node.title, this.props.node.selected);
          if (this.props.node.selected) {
            var el = $(this.getDOMNode()).children('h5').children('div');
            el.focus();
            setCursorLoc(el.get(0), this.props.node.caretLoc);
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

    var renderAll = function(tree) {
        React.renderComponent(
          <TreeNode node={tree} />,
          document.getElementById("tree")
        );
    };

    //testSelectNext();
    return renderAll;
});





























