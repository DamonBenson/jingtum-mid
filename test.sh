#!/bin/bash

processes=(
    "./main/req/uploadReq.js"
    "./main/req/authReq.js"
    "./main/req/transferReq.js"
    "./main/mid/mainMid.js"
    "./main/mid/authServer.js"
    "./main/watch/chain0Watch.js"
    "./main/watch/chain1Watch.js"
)
logs=(
    "./uploadReq.log"
    "./authReq.log"
    "./transferReq.log"
    "./mainMid.log"
    "./authServer.log"
    "./chain0Watch.log"
    "./chain1Watch.log"
)
job_count=${#processes[*]}

while getopts "se" arg
do
    case $arg in
        s)
            for ((i=0;i<${job_count-1};i++))
            do
                echo "starting "${processes[$i]}"..."
                nohup node ${processes[$i]} >> ${logs[$i]} 2>&1 &
            done
            ;;
        e)
            for ((i=0;i<${job_count-1};i++))
            do
                echo "killing "${processes[$i]}"..."
                pids=`ps -ef | grep ${processes[$i]} | grep -v grep | awk '{print $2}'`
                echo $pids
                for pid in $pids
                do
                    kill -9 $pid
                done
            done
            ;;
    esac
done