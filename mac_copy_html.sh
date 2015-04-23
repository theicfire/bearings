# If your clipboard has some html in it (like copying from workflowy), you can turn
# that formatted text into html, which is then put into the keyboard, using this line.
osascript -e 'the clipboard as "HTML"'|perl -ne 'print chr foreach unpack("C*",pack("H*",substr($_,11,-3)))' | pbcopy
