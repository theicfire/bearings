index:
	node_modules/watchify/bin/cmd.js js/main.js -o js/bundle.js -v -d
import:
	node_modules/watchify/bin/cmd.js js/import.js -o js/bundleimport.js -v -d

# If your clipboard has some html in it (like copying from workflowy), you can turn
# that formatted text into html, which is then put into the keyboard, using this line (depending on os).
mac_copy:
	osascript -e 'the clipboard as "HTML"'|perl -ne 'print chr foreach unpack("C*",pack("H*",substr($$_,11,-3)))' | pbcopy
linux_copy:
	xclip -selection clipboard -o -t text/html
init_config:
	cp js/config.default.js js/config.js
init_encrypted_config:
	gpg --decrypt js/config.js.gpg > js/config.js
encrypt_config:
	cat js/config.js | gpg -e -r chase > js/config.js.gpg
