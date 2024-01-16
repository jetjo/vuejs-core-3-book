#!/bin/bash

echo $0

# 获取脚本自身的路径
script_path=$(dirname "$0")
# 获取脚本自身的绝对路径
script_path_abs=$(dirname "$(readlink -f "$0")")

echo "脚本相对于工作目录的路径: $script_path"
echo "脚本自身的绝对路径是: $script_path_abs"
