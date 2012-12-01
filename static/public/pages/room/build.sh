#!/bin/sh
# TEMPLATES
name="room"
pageClass="RoomPage"
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
# TYPESCRIPT
out="./page.js"
tsc --sourcemap --out $out scripts/$pageClass.ts
