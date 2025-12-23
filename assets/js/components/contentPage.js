/**
 * content-page.html 示例页组件
 * 集成 TradingView Lightweight Charts K 线图示例
 */
function contentPage() {
  return {
    chart: null,
    dataUrl: 'assets/data/sample-kline.json',

    init() {
      this.$nextTick(() => this.initKlineChart());
    },

    async initKlineChart(retry = 0) {
      const container = this.$refs.kline;
      if (!container) return;

      if (!window.LightweightCharts || typeof window.LightweightCharts.createChart !== 'function') {
        container.innerHTML =
          '<div class="text-sm text-red-600">Lightweight Charts 未加载，请检查 index.html 是否已引入脚本。</div>';
        return;
      }

      const rect = container.getBoundingClientRect();
      const width = Math.floor(rect.width || 0);
      const height = Math.floor(rect.height || 0);
      if ((width <= 10 || height <= 10) && retry < 10) {
        requestAnimationFrame(() => this.initKlineChart(retry + 1));
        return;
      }

      const pad2 = (n) => String(n).padStart(2, '0');
      const formatMMDD = (time) => {
        if (typeof time === 'number') {
          const d = new Date(time * 1000);
          return `${pad2(d.getUTCMonth() + 1)}/${pad2(d.getUTCDate())}`;
        }
        if (time && typeof time === 'object' && 'month' in time && 'day' in time) {
          return `${pad2(time.month)}/${pad2(time.day)}`;
        }
        return '';
      };

      const chart = window.LightweightCharts.createChart(container, {
        width: Math.max(320, width),
        height: Math.max(260, height),
        layout: {
          background: { color: '#ffffff' },
          textColor: '#111827',
          attributionLogo: false,
        },
        localization: {
          locale: 'zh-CN',
          dateFormat: 'mm/dd',
          timeFormatter: formatMMDD,
        },
        grid: {
          vertLines: { color: '#f3f4f6' },
          horzLines: { color: '#f3f4f6' },
        },
        rightPriceScale: {
          borderColor: '#e5e7eb',
        },
        timeScale: {
          borderColor: '#e5e7eb',
          timeVisible: true,
          secondsVisible: true,
          tickMarkFormatter: (time) => formatMMDD(time),
        },
      });

      if (!chart || typeof chart.addSeries !== 'function') {
        container.innerHTML =
          '<div class="text-sm text-red-600">Lightweight Charts API/div>';
        return;
      }

      const candleSeries = chart.addSeries(window.LightweightCharts.CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderUpColor: '#10b981',
        borderDownColor: '#ef4444',
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });

      const volumeSeries = chart.addSeries(window.LightweightCharts.HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: '',
      });

      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });

      let seriesData;
      try {
        const json = await this.loadSampleData();
        seriesData = this.convertBarsToSeriesData(json.bars);
      } catch (err) {
        console.warn('[contentPage] Failed to load sample K-line JSON, using fallback data:', err);
        seriesData = this.buildSampleData();
      }

      const { candles, volumes } = seriesData;
      candleSeries.setData(candles);
      volumeSeries.setData(volumes);
      chart.timeScale().fitContent();

      this.chart = chart;
    },

    async loadSampleData() {
      const res = await fetch(this.dataUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status} loading ${this.dataUrl}`);
      const json = await res.json();
      if (!json || !Array.isArray(json.bars)) throw new Error('Invalid sample data JSON: missing bars[]');
      return json;
    },

    toBusinessDay(dateString) {
      const [year, month, day] = String(dateString).split('-').map((v) => Number(v));
      if (!year || !month || !day) throw new Error(`Invalid date: ${dateString}`);
      return { year, month, day };
    },

    convertBarsToSeriesData(bars) {
      const candles = [];
      const volumes = [];

      for (const bar of bars) {
        if (!Array.isArray(bar) || bar.length < 6) continue;
        const [date, open, high, low, close, volume] = bar;
        const time = this.toBusinessDay(date);

        candles.push({ time, open, high, low, close });
        volumes.push({
          time,
          value: volume,
          color: Number(close) >= Number(open) ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)',
        });
      }

      if (!candles.length) throw new Error('No valid bars in sample data');
      return { candles, volumes };
    },

    buildSampleData() {
      let seed = 42;
      const rand = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };

      const start = new Date(Date.UTC(2025, 0, 1));

      const candles = [];
      const volumes = [];
      let price = 100;

      for (let i = 0; i < 60; i++) {
        const time = this.toBusinessDay(new Date(start.getTime() + i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
        const open = price;
        const delta = (rand() - 0.5) * 6;
        const close = Math.max(10, open + delta);
        const high = Math.max(open, close) + rand() * 3;
        const low = Math.min(open, close) - rand() * 3;

        candles.push({
          time,
          open: Number(open.toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          close: Number(close.toFixed(2)),
        });

        const up = close >= open;
        volumes.push({
          time,
          value: Math.floor(800 + rand() * 3200),
          color: up ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)',
        });

        price = close;
      }

      return { candles, volumes };
    },
  };
}
