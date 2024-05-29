<script setup>
    import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";
    import { Line } from 'vue-chartjs';
    import * as chartConfig from '/assets/js/chartInfo.js'
    import {Chart as ChartJS,CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend,Filler,Decimation} from 'chart.js';
    ChartJS.register(CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend,Filler,Decimation);

    // Data for chart renders
    const voltageChart = chartConfig.voltageChart;
    const currentChart = chartConfig.currentChart;
    const voltage = ref(chartConfig.getVoltage([5,7,4,2,1]))
    const current = ref(chartConfig.getCurrent([2,5,7,0,0,0,0,6,4]))
    
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
        data.value = content;
    });
    socket.on('error', (content) => {
        console.error("SOCKET ERROR: " + content);
        error.value = content;
    });

    let newVoltage = [0, 0, 0, 0, 0];
    let newCurrent = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    onMounted(() => {
        setInterval(() => {
            (newVoltage).push(15);
            (newVoltage).shift();
            (newCurrent).push(15);
            (newCurrent).shift();
            voltage.value = chartConfig.getVoltage(newVoltage);
            current.value = chartConfig.getCurrent(newCurrent);
            console.log("changed");
	    console.log(voltage.value.datasets[0].data);
	    console.log(current.value.datasets[0].data);
        }, 3000)
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
                    <LazyLineChart :chartData="current" :chartOptions="currentChart" class="bg-gray-200 rounded-md" />
                </div>
                <div class="w-full h-[2px] flex justify-center items-center px-3">
                    <div class="bg-gray-200 h-full w-full rounded-full"></div>
                </div>
                <div class="flex justify-center items-center gap-5 w-full h-[59vh] py-5">
                    <div class="w-[45%] h-full flex flex-col gap-3 justify-center items-center">
			    <h1 class="text-3xl">Voltage: {{ data.voltage }}</h1>
                        <Line :data="voltage" :options="voltageChart" class="bg-gray-200 rounded-md" />
                    </div>
                    <div class="w-[45%] h-full flex flex-col gap-3 justify-center items-center">
			    <h1 class="text-3xl">Current: {{ data.current }}</h1>
                        <Line :data="current" :options="currentChart" class="bg-gray-200 rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    </div>
    
</template>
