#!/bin/bash

# Useful for `git difftool`
# `git difftool --extcmd=/path/to/git-difftool-changed-lines.sh`

# Outputs the lines numbers of the new file
# that are not present in the old file.
# That is, outputs line numbers for new lines and changed lines
# and does not output line numbers deleted or unchanged lines.

# FORMAT: One file per line
# FILE:LINE_NUMBERS
# Where LINE_NUMBERS is a comma separated list of line numbers


args=(
	# Don't output info for old (deleted) or unchanged (context) lines
	--old-group-format="" --unchanged-group-format=""

	# For new and changed lines, output one LINE_RANGE per line
	--new-group-format="%dF-%dL%c'\012'"
	--changed-group-format="%dF-%dL%c'\012'"
)


# `git difftool` calls this command as `git-difftool.sh "$LOCAL" "$REMOTE"
# and adds BASE to the environment.
# See https://git-scm.com/docs/git-difftool#Documentation/git-difftool.txt--xltcommandgt

echo -n "\"$BASE\":["

diff "${args[@]}" "$1" "$2" | while IFS=- read -r LINE END; do
	echo -n "$(( LINE++ ))"
	for (( ; LINE  <= END; LINE++ )); do
		echo -n ",$LINE"
	done
	echo -n ","
done
echo "],"
