#!/bin/sh
dustc --name="lib-dialog-simple" templates/simple-dialog-view.html > ./templates/simple-dialog-view.ts
dustc --name="lib-dialog-select" templates/select-dialog-view.html > ./templates/select-dialog-view.ts
tsc --declaration --sourcemap --target ES5 --out ../app.js app.ts
if [ -f ../app.d.ts ]
then
    mv ../app.d.ts ../../pages/lib/app.d.ts
fi