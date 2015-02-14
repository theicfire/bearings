define(['react', 'tree', 'jquery', 'underscore'], function(React, Tree, $, _) {
    var globalTree;

    var setCursorLoc = function(contentEditableElement, caretLoc) {
        return;
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
          visible: true,
          title: this.props.node.title
        };
      },
    handleChange: function(event) {
        var selected = Tree.findSelected(globalTree); // TODO same as changing props... humm
        selected.title = event.target.value;
        var caretLoc = getCaretPosition(this.refs.input.getDOMNode());
        selected.caretLoc = caretLoc;
        this.setState({visible: this.state.visible, title: event.target.value});
    },
      componentDidMount: function() {
          //console.log('mounted', this.props.node.title, this.props.node.selected);
          if (this.props.node.selected) {
            var el = $(this.getDOMNode()).children('h5').children('input');
            el.focus();
            //console.log('hi there', this.props.node);
            setCaretPosition(el.get(0), this.props.node.caretLoc);
          }

        var that = this;
        $(this.refs.input.getDOMNode()).keydown(function(e) {
            if (e.keyCode === 37) {
                console.log('left');
            } else if (e.keyCode === 38) {
                console.log('up');
                Tree.selectPreviousNode(globalTree);
                selected = Tree.findSelected(globalTree);
                selected.caretLoc = 0;
                renderAll(globalTree);
                return false;
            } else if (e.keyCode === 39) {
                console.log('right');
            } else if (e.keyCode === 40) {
                console.log('down');
                Tree.selectNextNode(globalTree);
                selected = Tree.findSelected(globalTree);
                selected.caretLoc = 0;
                renderAll(globalTree);
                console.log('tree now', globalTree);
                return false;
            } else if (e.keyCode === 13) {
                var caretLoc = getCaretPosition(that.refs.input);
                selected.caretLoc = caretLoc;
                console.log('loc', selected.caretLoc);
                selected = Tree.findSelected(globalTree);
                //console.log('selected', selected);
                Tree.newLineAtCursor(globalTree);
                selected = Tree.findSelected(globalTree);
                //console.log('selected', selected);
                renderAll(globalTree);
                console.log('tree now', globalTree);
                return false;
            } else if (e.keyCode === 8) {
                var caretLoc = getCaretPosition(that.refs.input);
                selected.caretLoc = caretLoc;
                console.log('backspace', caretLoc);
                if (selected.caretLoc === 0) {
                    Tree.backspaceAtBeginning(globalTree);
                    selected = Tree.findSelected(globalTree);
                    renderAll(globalTree);
                    return false;
                }
            } else {
                console.log(e.keyCode);
            }
        });

      },
      componentDidUpdate: function(prevProps, prevState) {
          //console.log('did update', this.props.node.title, this.props.node.selected);
          if (this.props.node.selected) {
            var el = $(this.getDOMNode()).children('h5').children('input');
            el.focus();
            console.log('set position', this.props.node.caretLoc);
            setCaretPosition(el.get(0), this.props.node.caretLoc);
          }
      },
      componentWillReceiveProps: function(nextProps) {
        this.setState({visible: this.state.visible, title: nextProps.node.title});
      },
      render: function() {
        var childNodes;
        var className = "dot";
        //console.log('render: ', this.props.node);
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
              <input ref="input" type="text" value={this.state.title} onChange={this.handleChange}/> {this.props.node.parent ? 'parent: ' + this.props.node.parent.title : ''}
            </h5>
            <ul style={style}>
              {childNodes}
            </ul>
          </div>
        );
      },
      toggle: function() {
        this.setState({visible: !this.state.visible, title: this.state.title});
      }
    //  textclick: function() {
    //    console.log('text clicked', this);
    //    this.getDOMNode().contentEditable = true;
    //    this.getDOMNode().focus();
    //  },
    });

    function startRender(tree) {
        globalTree = tree;
        renderAll();
    }
    function renderAll() {
        console.log('rendering with', globalTree);
        React.renderComponent(
          <TreeNode node={globalTree} />,
          document.getElementById("tree")
        );
    };
    /*
    ** Returns the caret (cursor) position of the specified text field.
    ** Return value range is 0-oField.value.length.
    */
    function getCaretPosition (oField) {

      // Initialize
      var iCaretPos = 0;

      // IE Support
      if (document.selection) {

        // Set focus on the element
        oField.focus ();

        // To get cursor position, get empty selection range
        var oSel = document.selection.createRange ();

        // Move selection start to 0 position
        oSel.moveStart ('character', -oField.value.length);

        // The caret position is selection length
        iCaretPos = oSel.text.length;
      }

      // Firefox support
      else if (oField.selectionStart || oField.selectionStart == '0')
        iCaretPos = oField.selectionStart;

      // Return results
      return (iCaretPos);
    }

    function setCaretPosition (el, loc) {
        el.setSelectionRange(loc, loc);
    };

function getCaretCharacterOffsetWithin(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}

    //testSelectNext();
    return startRender;
});

