<script setup lang="ts">
import { useFinanceStore } from '../store/finance';
import { computed } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import VChart from 'vue-echarts';

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent]);
const store = useFinanceStore();

const chartOption = computed(() => {
  const data = store.projection;
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      textStyle: { color: '#111827', fontFamily: 'Inter' },
      formatter: (params: any) => {
        const month = params[0].name;
        let html = `<div style="font-weight:600; margin-bottom:8px;">${month}</div>`;
        let total = 0;
        params.forEach((p: any) => {
          total += p.value;
          html += `<div style="display:flex; justify-content:space-between; gap:16px;">
            <span style="color:#6B7280">${p.seriesName}</span>
            <span>R$ ${p.value.toFixed(2)}</span>
          </div>`;
        });
        html += `<div style="border-top:1px solid #E5E7EB; margin-top:8px; padding-top:8px; font-weight:600; display:flex; justify-content:space-between;">
          <span>Total</span><span>R$ ${total.toFixed(2)}</span>
        </div>`;
        return html;
      }
    },
    grid: { left: '0%', right: '0%', bottom: '0%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(d => d.label),
      axisLine: { lineStyle: { color: '#E5E7EB' } },
      axisLabel: { color: '#6B7280', fontFamily: 'Inter' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#E5E7EB' } },
      axisLabel: { color: '#6B7280', fontFamily: 'Inter' }
    },
    series: store.cards.map(card => ({
      name: card.name,
      type: 'bar',
      stack: 'total',
      barWidth: '40%',
      data: data.map(d => ({
        value: (d as Record<string, any>)[card.id] || 0,
        itemStyle: { 
          color: card.color || '#2563eb', 
          opacity: d.isCurrent ? 1 : 0.35 
        }
      }))
    }))
  };
});
</script>

<template>
  <div class="base-card chart-container">
    <h3 class="mb-6">6-Month Commitment Projection</h3>
    <div class="chart-wrapper">
      <v-chart class="chart" :option="chartOption" autoresize />
    </div>
  </div>
</template>

<style scoped>
.chart-container { width: 100%; }
.chart-wrapper {
  height: 300px;
  width: 100%;
  overflow-x: auto;
}
.chart {
  min-width: 500px;
  height: 100%;
}
.mb-6 { margin-bottom: 24px; }
</style>
