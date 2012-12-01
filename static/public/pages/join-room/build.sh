#!/bin/sh
# TEMPLATES
name="join-room"
pageClass="JoinRoomPage"
mobileName="page-$name-mobile"
desktopName="page-$name-desktop"
out="./template.js"
if [ -f $out ]
then
    rm $out
fi
if [ -f $mobileName.html ]
then
    dustc --name="$mobileName" $mobileName.html >> $out
fi
if [ -f $desktopName.html ]
then
    dustc --name="$desktopName" $desktopName.html >> $out
fi
# VIEWS
dir=scripts/views/ 
dustc --name="dialog-create-room" $dir/dialog-create-room.html >> $dir/dialog-create-room.ts
# TYPESCRIPT
out="./page.js"
tsc --sourcemap --out $out scripts/$pageClass.ts
