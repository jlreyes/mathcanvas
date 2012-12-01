#!/bin/sh
# Recursively call all build.sh's
root=$(pwd)
function f {
    files=$(ls)
    for file in $files
    do
        if [ -d $file ]
        then
            dir=$file
            cd $dir
            f
        fi
    done
    builds=$(ls | grep ^build.sh$)
    if [ $builds ]
    then
        test=$(pwd | grep "^$root$")
        if [ $test ]
        then
            echo "DONE"
        else
            ./build.sh
        fi
    fi
    cd ..
}
f
cd $root
