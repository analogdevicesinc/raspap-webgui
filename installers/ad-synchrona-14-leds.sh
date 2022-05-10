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

EXIT_SIGNAL=0

trap synchrona_leds_exit SIGTERM
synchrona_leds_exit()
{
	EXIT_SIGNAL=1
}

[ ! -d "/sys/class/gpio/gpio$RED_LED1" ] && echo $RED_LED1 > "/sys/class/gpio/export"
[ ! -d "/sys/class/gpio/gpio$GREEN_LED1" ] && echo $GREEN_LED1 > "/sys/class/gpio/export"

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

	echo "out" > "/sys/class/gpio/gpio$RED_LED1/direction"
	echo "out" > "/sys/class/gpio/gpio$GREEN_LED1/direction"

	# On script exit leave just the red LED on
	if [[ $EXIT_SIGNAL == 1 ]]; then
		echo 1 > "/sys/class/gpio/gpio$RED_LED1/value"
		echo 0 > "/sys/class/gpio/gpio$GREEN_LED1/value"

		echo $RED_LED1 > "/sys/class/gpio/unexport"
		echo $GREEN_LED1 > "/sys/class/gpio/unexport"
		exit 0
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
