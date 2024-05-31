<template>
    <Line :data="chartData" :options="chartOptions" />
</template>
  
<script>
    import { Line } from 'vue-chartjs'
    import {Chart as ChartJS,CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend,Filler,Decimation} from 'chart.js';
    ChartJS.register(CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend,Filler,Decimation);
    
    export default {
            name: 'LineChart',
            components: { Line },
	    
            
            props: {
                chartData: {
                type: Object,
                required: true
                },
                chartOptions: {
                    type: Object,
                    default: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                display: false,
                            },
                            tooltip: {
                                enabled: false
                            },
                            decimation: {
                                enabled: true,
                                algorithm: 'lttb',
                                samples: 8,
                                threshold: 2,
                            }
                        },
                        scales: {
                            x: {
                                ticks: {
                                    source: 'auto',
                                    // Disabled rotation for performance
                                    maxRotation: 0,
                                    autoSkip: true,
                                    color: 'black',
                                    padding: 6
                                },
                                grid: {
                                    drawTicks: false
                                }
                            },
                            y: {
                                ticks: {
                                    color: 'black', 
                                    padding: 6
                                },
                                grid: {
                                    drawTicks: false,
                                }
                            }
                        },
                        aspectRatio: 1/1,
                    }
                }
            }
	}
            
    
</script>
