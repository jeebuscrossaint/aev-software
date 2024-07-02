<script setup>
    import { Line } from 'vue-chartjs';
    import { Doughnut } from 'vue-chartjs'
    import * as chartConfig from '/assets/js/chartInfo.js'
    import {Chart as ChartJS,CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend,Filler,Decimation,ArcElement} from 'chart.js';
    
    // Data for chart renders & reactivity
    ChartJS.register(CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend,Filler,Decimation,ArcElement);
    let reloaded = ref(true);
    const voltageChart = chartConfig.voltageChart;
    const currentChart = chartConfig.currentChart;
    const batteryChart = chartConfig.batteryChart;
    const voltage = ref(chartConfig.getVoltage([0, 0, 0, 0, 0, 0, 0, 0, 0]));
    const current = ref(chartConfig.getCurrent([0, 0, 0, 0, 0, 0, 0, 0, 0]));
    const battery = ref(chartConfig.getBattery([0,100]));

    // Functions to update charts
    function updateVoltage(newVoltage, newMean){
        for (let i = 0; i < voltage.value.datasets[0].data.length; i++) {
            if (i == voltage.value.datasets[0].data.length - 1) {
                voltage.value.datasets[0].data[i] = newMean;
                break;
            }
            else{
                voltage.value.datasets[0].data[i] = voltage.value.datasets[0].data[i+1];
            }
        }
        for (let i = 0; i < voltage.value.datasets[1].data.length; i++) {
            if (i == voltage.value.datasets[1].data.length - 1) {
                voltage.value.datasets[1].data[i] = newVoltage;
                break;
            }
            else{
                voltage.value.datasets[1].data[i] = voltage.value.datasets[1].data[i+1];
            }
        }
    }
    function updateCurrent(newCurrent){
        for (let i = 0; i < current.value.datasets[0].data.length; i++) {
            if (i == current.value.datasets[0].data.length - 1) {
                current.value.datasets[0].data[i] = newCurrent;
                break;
            }
            else{
                current.value.datasets[0].data[i] = current.value.datasets[0].data[i+1];
            }
        }
    }
    function updateBattery(newCharge){
        battery.value.datasets[0].data[0] = newCharge;
        battery.value.datasets[0].data[1] = 100-newCharge;
        if(40 < newCharge && newCharge <= 100){
            battery.value.datasets[0].backgroundColor[0] = 'Green'
        }
        else if(10 < newCharge && newCharge <= 40){
            battery.value.datasets[0].backgroundColor[0] = 'Orange'
        }
        else if(newCharge <= 10){
            battery.value.datasets[0].backgroundColor[0] = 'Red'
        }
    }

    // Data & Error Refs for template access (reactivity)
    let data = ref({
        "voltage":"0v",
        "cells":"0",
        "mean":"0v",
        "stddev":"0v",
        "alerts": ["not locked", "pack in HVM", "pack in LVM", "Alert 4a"],
        "current":"0A",
        "SOC":"0%",
        "uptime":["00","00","00"]
    });
    let error = ref({});

    // Stream to receive backend data & update graphs

    /* PROPER WS IMPLEMENTATION */
    const socket = new WebSocket("ws://localhost:3001");
    // Message Handler
    socket.onmessage = (event) => {
        // Update All data
        const split = (event.data).split("|");
        if (split[0] === "bms-data") {
            data.value = JSON.parse(split[1]);
        }
        // Voltage
        updateVoltage(Number((data.value.voltage).slice(0, -1)), Number((data.value.mean).slice(0, -1)));
        // Current
        updateCurrent(Number((data.value.current).slice(0, -1)));
        // Battery
        updateBattery(Number((data.value.SOC).slice(0, -1)));
        // Reload Graphs
        reloaded.value = !(reloaded.value);
    }

    /* RESTAPI IMPLEMENTATION */
    async function getBMSData(route) {
        const response = await $fetch(`http://localhost:3001${route}`, {
            method: 'GET'
        })
        if(route == '/bms/data'){
            data.value = JSON.parse(response);
            // Voltage
            updateVoltage(Number((data.value.voltage).slice(0, -1)), Number((data.value.mean).slice(0, -1)));
            // Current
            updateCurrent(Number((data.value.current).slice(0, -1)));
            // Battery
            updateBattery(Number((data.value.SOC).slice(0, -1)));
            // Reload Graphs
            reloaded.value = !(reloaded.value);
        }
    }

    onMounted(() => {
        setInterval(() => {
            /* WS IMPLEMENTATION */
            socket.send("bms-data");

            /* RESTAPI IMPLEMENTATION - (Make single button to restart BMS and log its status to console when pressed if we use this implementation) */
            // getBMSData('/bms/data');
        }, 500);

        /* Testing Graphs & Values -- COMMENT THIS OUT WHEN PLUGGING IN BMS */
        /*
        function rand(min, max) {
            return Math.random() * (max - min) + min;
        }
        data.value = {
            "voltage":"91.84v",
            "cells":"30(notlocked)",
            "mean":"3.062v",
            "stddev":"0.037v",
            "alerts":"notlocked",
            "current":"-5.2A",
            "SOC":"4%",
            "uptime":["0","34","26"]
        }
        let battIteration = 0;
        setInterval(async () => {
            // Voltage
            let randVolt = rand(75, 90);
            data.value.voltage = Math.round(randVolt * 100) / 100;
            updateVoltage(randVolt, randVolt/30);
            // Current
            let randCurr = rand(-8, 10);
            data.value.current = Math.round(randCurr * 100) / 100;
            updateCurrent(randCurr);
            // Battery
            let battCycl = [100, 74, 40, 26, 10, 4];
            data.value.SOC = battCycl[battIteration];
            updateBattery(battCycl[battIteration]);
            battIteration++;
            if(battIteration == 6){
                battIteration = 0;
            }
            // Reload Graphs
            reloaded.value = !(reloaded.value)
        }, 550);
        */
    });
</script>

<template>
    <!--Shows Error Page if BMS backend isn't working-->
    <div v-if="JSON.stringify(error)!='{}'">
        <div class="flex justify-center items-center bg-[#F9FBFD] p-2">
            <!-- <img src="/alsetSideLogo.png" alt="" class="absolute top-5 w-[150px] sm:w-[200px] hidden sm:block"> -->
            <div class="w-full h-full rounded-3xl flex flex-col items-center py-2 sm:py-10 gap-2">
                <h1 class="font-bold text-4xl sm:text-5xl bg-gradient-to-r from-blue-500 via-black to-red-500 inline-block text-transparent bg-clip-text">
                    BMS Error!
                </h1>

                <p class="text-lg sm:text-xl min-w-[80%] text-left">
                    <br>
                    <strong>Error message:</strong> {{ JSON.stringify(error) }}
                    <br><br>
                </p>

                <p class="text-lg sm:text-xl leading-tight min-w-[80%] text-left font-bold">Things to check</p>
                <ul class="text-md sm:text-md min-w-[80%] max-w-[85%]">
                    <li>- Make sure the BMS is on & connected to the RPI.</li>
                    <li>- Make sure the 12v battery is charged, plugged in, & on.</li>
                </ul>

                <p class="text-lg sm:text-xl min-w-[80%] text-left font-bold">Things to try</p>
                <ul class="text-md sm:text-md min-w-[80%] max-w-[85%]">
                    <li>- Restarting the BMS first, then the RPI.</li>
                    <li>- Restart just the BMS.</li>
                    <li>- Restart just the RPI.</li>
                    <li>- Unplug & replug the BMS then restart the RPI.</li>
                    <li>- Grab Zach or Amarnath & debug the issue with a keyboard.</li>
                </ul>
            </div>
        </div>
    </div>
    <!--Shows Functional Page if there aren't any issues-->
    <div v-else>
        <!--Full Screen Container-->
        <div class="flex justify-center items-center h-[50vh]">
            <!--Content Container-->
            <div class="w-full h-full flex flex-col justify-center items-center max-w-[900px]">
                <!--Logo-->
                <img src="/alsetSideLogo.png" alt="" class="hidden absolute top-5 w-[150px] sm:w-[200px]">
                <!--Top Section-->
                <section class="flex gap-5 h-[40%] w-[95%] p-5 justify-between items-center">
                    <!--Battery Info Text-->
                    <div class="max-w-[50%] flex flex-col gap-5">
                        <!-- <h1 class="text-3xl sm:text-5xl font-semibold">Battery</h1>  -->
                        <div class="sm:text-2xl">
                            Alerts: <br>
                            <div class="sm:text-lg flex flex-wrap"><span class="mx-2" v-for="alert in data.alerts">{{ alert }}</span></div>
                            Cells: {{ data.cells }}<br>
                            Stddev: {{ data.stddev }}<br>
                            Uptime: {{ data.uptime[0] }}:{{ data.uptime[1] }}:{{ data.uptime[2] }}
                        </div>
                    </div>
                    <!--Battery Gaugue-->
                    <div v-if="reloaded" class="w-[45%] h-full flex justify-center items-center">
                        <!-- This calculates the SOC based on voltage BTW... (its being devided by 33 since 108-75 (max/min voltage) is 33) -->
                        <h1 class="text-4xl sm:text-6xl font-bold absolute"><br>{{ data.SOC }}</h1> 
                        <Doughnut :data="battery" :options="batteryChart" class="w-full" />
                    </div>
                    <div v-if="!reloaded" class="w-[45%] h-full flex justify-center items-center">
                        <h1 class="text-4xl sm:text-6xl font-bold absolute"><br>{{ data.SOC }}</h1>
                        <Doughnut :data="battery" :options="batteryChart" class="w-full" />
                    </div>
                </section>
                <!--Div ider (bc its a div & divider... heh)-->
                <!-- <div class="w-full h-[2px] flex justify-center items-center px-3">
                    <div class="bg-gray-200 h-full w-full rounded-full"></div>
                </div> -->
                <!--Bottom Section-->
                <section class="flex justify-center items-center gap-5 w-full h-[60%] py-5">
			        <!--Voltage Graph-->
                    <div v-if="reloaded == true" class="w-[45%] h-full flex flex-col gap-3 justify-center items-center">
                        <h1 class="text-3xl">Voltage: {{ data.voltage }}</h1>
                        <Line :data="voltage" :options="voltageChart" class="bg-gray-200 rounded-md w-full" />
                    </div>
                    <div v-if="reloaded == false" class="w-[45%] h-full flex flex-col gap-3 justify-center items-center">
                        <h1 class="text-3xl">Voltage: {{ data.voltage }}</h1>
                        <Line :data="voltage" :options="voltageChart" class="bg-gray-200 rounded-md w-full" />
                    </div>
                    <!--Current Graph-->
                    <div v-if="reloaded == true" class="w-[45%] h-full flex flex-col gap-3 justify-center items-center">
                        <h1 class="text-3xl">Current: {{ data.current }}</h1>
                        <Line :data="current" :options="currentChart" class="bg-gray-200 rounded-md w-full" />
                    </div>
                    <div v-if="reloaded == false" class="w-[45%] h-full flex flex-col gap-3 justify-center items-center">
                        <h1 class="text-3xl">Current: {{ data.current }}</h1>
                        <Line :data="current" :options="currentChart" class="bg-gray-200 rounded-md w-full" />
                    </div>
                </section>
            </div>
        </div>
    </div>
    <!--Divmania lol-->
</template>
