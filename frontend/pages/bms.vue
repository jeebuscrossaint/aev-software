<script setup>
    import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";
    import { Line } from 'vue-chartjs';
    import * as chartConfig from '/assets/js/chartInfo.js'
    import {Chart as ChartJS,CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend,Filler,Decimation} from 'chart.js';
    ChartJS.register(CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend,Filler,Decimation);

    // Data for chart renders & reactivity
    let reloaded = ref(true);
    const voltageChart = chartConfig.voltageChart;
    const currentChart = chartConfig.currentChart;
    const voltage = ref(chartConfig.getVoltage([0, 0, 0, 0, 0]));
    const current = ref(chartConfig.getCurrent([0, 0, 0, 0, 0, 0, 0, 0, 0]));
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
    
    // Data & Error Refs for direct HTML access
    let data = ref({
        "voltage":"91.84v",
        "cells":"30(notlocked)",
        "mean":"3.062v",
        "stddev":"0.037v",
        "alerts":"notlocked",
        "current":"-0.2A",
        "SOC":"4%",
        "uptime":["0","34","26"]
    })
    let error = ref({});

    // Stream to receive backend data & update graphs
    const socket = io('http://localhost:3000', {  reconnectionDelayMax: 10000,});
    socket.on('data', (content) => {
        // Update All data
        data.value = content;
        // Voltage
        updateVoltage(Number((data.value.voltage).slice(0, -1)), Number((data.value.mean).slice(0, -1)));
        // Current
        updateCurrent(Number((data.value.current).slice(0, -1)));
        // Reload Graphs
        reloaded.value = !(reloaded.value)
    });
    socket.on('error', (content) => {
        console.error("SOCKET ERROR: " + content);
        error.value = content;
    });

    // Testing Graphs
    onMounted(() => {
        setInterval(async () => {
            // Voltage
            updateVoltage(Number((data.value.voltage).slice(0, -1)), Number((data.value.mean).slice(0, -1)));
            // Current
            updateCurrent(Number((data.value.current).slice(0, -1)));
            // Reload Graphs
            reloaded.value = !(reloaded.value)
        }, 500);
    });
</script>
<template>
    <div v-if="JSON.stringify(error)!='{}'">
        Error: {{ JSON.stringify(error) }}
    </div>
    <div v-else>
        <div class="w-screen flex justify-center items-center">
            <div class="w-full h-full flex flex-col justify-center items-center flex-wrap max-w-[900px]">
                <div class="flex gap-5 h-[40vh] w-[95%] p-5 justify-between items-center">
                    <div class="flex flex-col gap-5">
                        <h1 class="text-3xl font-semibold">Battery</h1> 
                        <p>
                            Alerts: {{ data.alerts }}<br>
                            Cells: {{ data.cells }}<br>
                            Uptime: {{ data.uptime[0] }}:{{ data.uptime[1] }}:{{ data.uptime[2] }}<br>
                            Charge: {{ data.SOC }}
                        </p>
                    </div>
                    <!--Battery Gaugue-->
                    <div v-if="reloaded">
                        
                    </div>
                    <div v-if="!reloaded">

                    </div>
                    
                </div>
                <!--Divider-->
                <div class="w-full h-[2px] flex justify-center items-center px-3">
                    <div class="bg-gray-200 h-full w-full rounded-full"></div>
                </div>
                <div class="flex justify-center items-center gap-5 w-full h-[59vh] py-5">
			        <!--Voltage-->
                    <div v-if="reloaded == true" class="w-[45%] h-full flex flex-col gap-3 justify-center items-center">
                        <h1 class="text-3xl">Voltage</h1>
                        <div class="absolute">
                            <p class="text-3xl sm:text-5xl font-bold text-red-600">{{ data.voltage }}</p>
                            <p class="text-3xl sm:text-5xl font-bold text-blue-600">{{ data.mean }}</p>
                        </div>
                        <Line :data="voltage" :options="voltageChart" class="bg-gray-200 rounded-md" />
                    </div>
                    <div v-if="reloaded == false" class="w-[45%] h-full flex flex-col gap-3 justify-center items-center">
                        <h1 class="text-3xl">Voltage</h1>
                        <div class="absolute">
                            <p class="text-3xl sm:text-5xl font-bold text-red-600">{{ data.voltage }}</p>
                            <p class="text-3xl sm:text-5xl font-bold text-blue-600">{{ data.mean }}</p>
                        </div>
                        <Line :data="voltage" :options="voltageChart" class="bg-gray-200 rounded-md" />
                    </div>
                    <!--Current-->
                    <div v-if="reloaded == true" class="w-[45%] h-full flex flex-col gap-3 justify-center items-center">
                        <h1 class="text-3xl">Current</h1>
                        <p class="text-3xl sm:text-5xl font-bold text-red-600 absolute">{{ data.current }}</p>
                        <Line :data="current" :options="currentChart" class="bg-gray-200 rounded-md" />
                    </div>
                    <div v-if="reloaded == false" class="w-[45%] h-full flex flex-col gap-3 justify-center items-center">
                        <h1 class="text-3xl">Current</h1>
                        <p class="text-3xl sm:text-5xl font-bold text-red-600 absolute">{{ data.current }}</p>
                        <Line :data="current" :options="currentChart" class="bg-gray-200 rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    </div>
    
</template>
