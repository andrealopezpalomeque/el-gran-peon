<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps({
  labels: { type: Array, required: true },
  datasets: { type: Array, required: true },
  title: { type: String, default: '' },
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map(ds => ({
    ...ds,
    backgroundColor: ds.backgroundColor || '#741617',
    borderColor: ds.borderColor || '#741617',
    borderWidth: ds.borderWidth ?? 0,
    borderRadius: 0,
    borderSkipped: false,
  })),
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: props.datasets.length > 1,
      labels: {
        font: { family: "'IBM Plex Sans', sans-serif", size: 12 },
        color: '#4C4A38',
      },
    },
    title: {
      display: !!props.title,
      text: props.title,
      font: { family: "'IBM Plex Sans', sans-serif", size: 14, weight: '600' },
      color: '#4C4A38',
      padding: { bottom: 16 },
    },
    tooltip: {
      backgroundColor: '#4C4A38',
      titleFont: { family: "'IBM Plex Sans', sans-serif" },
      bodyFont: { family: "'IBM Plex Sans', sans-serif" },
      cornerRadius: 0,
    },
  },
  scales: {
    x: {
      ticks: {
        font: { family: "'IBM Plex Sans', sans-serif", size: 11 },
        color: '#4C4A38',
      },
      grid: { display: false },
    },
    y: {
      ticks: {
        font: { family: "'IBM Plex Sans', sans-serif", size: 11 },
        color: '#4C4A38',
      },
      grid: { color: 'rgba(76, 74, 56, 0.1)' },
    },
  },
}))
</script>
