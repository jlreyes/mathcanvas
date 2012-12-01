#!/bin/sh
tsc --declaration --sourcemap --target ES5 --out ../app.js app.ts
if [ -f ../app.d.ts ]
then
    mv ../app.d.ts ../../pages/lib/app.d.ts
fi
