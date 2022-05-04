#!bin/bash

HMC7044_STATUS_PATH="/sys/kernel/debug/iio/iio:device0/status"
AD9545_STATUS_PATH="/sys/kernel/debug/clk/PLL1/PLL1"

RED_LED1=12
GREEN_LED1=16

STATUS_RED=0
STATUS_RED_BLINKING=1
STATUS_GREEN_BLINKING=2
STATUS_RED_GREEN_BLINKING=3
STATUS_GREEN=4

LED_STATUS=$STATUS_RED
AD9545_LOCKED=0
HMC7044_LOCKED=0
AD9545_FREERUN=0

while true
do
	ad9545_pll_status=$(cat $AD9545_STATUS_PATH)
	hmc7044_status=$(cat $HMC7044_STATUS_PATH)

	if [[ -z $(echo $ad9545_pll_status | grep -ie Unlocked) ]];
	then
		AD9545_LOCKED=1
	else
		AD9545_LOCKED=0
	fi

	if [[ -z $(echo $hmc7044_status | grep -ie Unlocked) ]];
	then
		HMC7044_LOCKED=1
	else
		HMC7044_LOCKED=0
	fi

	if [[ -z $(echo $ad9545_pll_status | grep -ie "Freerun Mode: On") ]];
	then
		AD9545_FREERUN=0
	else
		AD9545_FREERUN=1
	fi

	if [[ $(( $AD9545_LOCKED & !$AD9545_FREERUN & $HMC7044_LOCKED )) -eq 1 ]]; then
		LED_STATUS=$STATUS_GREEN
	elif [[ $(( $AD9545_LOCKED & !$AD9545_FREERUN & !$HMC7044_LOCKED )) -eq 1 ]]; then
		LED_STATUS=$STATUS_RED_BLINKING
	elif [[ $(( $AD9545_FREERUN & $HMC7044_LOCKED )) -eq 1 ]]; then
		LED_STATUS=$STATUS_GREEN_BLINKING
	elif [[ $(( !$AD9545_LOCKED & !$AD9545_FREERUN & $HMC7044_LOCKED )) -eq 1 ]]; then
		LED_STATUS=$STATUS_RED_GREEN_BLINKING
	else
		LED_STATUS=$STATUS_RED
	fi

	if [[ $LED_STATUS == $STATUS_GREEN ]]; then
		echo 0 > "/sys/class/gpio/gpio$RED_LED1/value"
		echo 1 > "/sys/class/gpio/gpio$GREEN_LED1/value"
	elif [[ $LED_STATUS == $STATUS_RED_BLINKING ]]; then
		echo 1 > "/sys/class/gpio/gpio$RED_LED1/value"
		echo 0 > "/sys/class/gpio/gpio$GREEN_LED1/value"
		sleep .5
		echo 0 > "/sys/class/gpio/gpio$RED_LED1/value"
	elif [[ $LED_STATUS == $STATUS_GREEN_BLINKING ]]; then
		echo 0 > "/sys/class/gpio/gpio$RED_LED1/value"
		echo 1 > "/sys/class/gpio/gpio$GREEN_LED1/value"
		sleep .5
		echo 0 > "/sys/class/gpio/gpio$GREEN_LED1/value"
	elif [[ $LED_STATUS == $STATUS_RED_GREEN_BLINKING ]]; then
		echo 0 > "/sys/class/gpio/gpio$RED_LED1/value"
		echo 1 > "/sys/class/gpio/gpio$GREEN_LED1/value"
		sleep .5
		echo 1 > "/sys/class/gpio/gpio$RED_LED1/value"
		echo 0 > "/sys/class/gpio/gpio$GREEN_LED1/value"
	else
		echo 1 > "/sys/class/gpio/gpio$RED_LED1/value"
		echo 0 > "/sys/class/gpio/gpio$GREEN_LED1/value"
	fi

	sleep 1
done
