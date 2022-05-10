#!/bin/sh
set -e

[ -n "$(dtoverlay -l | grep rpi-ad9545-hmc7044)" ] && dtoverlay -r rpi-ad9545-hmc7044
dtoverlay /boot/overlays/rpi-ad9545-hmc7044.dtbo
