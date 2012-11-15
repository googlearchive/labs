#!/bin/bash
UGLIFY='../libs/PointerEvents/third_party/uglifyjs/bin/uglifyjs'
FILES=(
  '../libs/PointerEvents/src/PointerEvent.js'
  '../libs/PointerEvents/src/sidetable.js'
  '../libs/PointerEvents/src/initialize.js'
  '../libs/PointerEvents/src/pointermap.js'
  '../libs/PointerEvents/src/dispatcher.js'
  '../libs/PointerEvents/src/platform-events.js'
  '../src/TkGestureEvent.js'
  '../src/initialize.js'
  '../src/dispatcher.js'
  '../src/hold.js'
  '../src/flick.js'
  '../src/track.js'
  '../src/zoomrotate.js'
)

if [[ ! -x $UGLIFY ]]; then
cat <<EOF
Please run 'git submodule update --init --recursive' from the top level of the repository to
check out uglifyjs for the build process
EOF
exit 1
fi

head -n 5 <../src/pointergestures.js >pointergestures.js
cat ${FILES[@]} | ${UGLIFY} -nc >> pointergestures.js
