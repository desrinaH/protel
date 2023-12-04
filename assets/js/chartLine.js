Highcharts.chart("container", {
  chart: {
    type: "line",
  },
  title: {
    text: "",
  },
  subtitle: {
    text: "",
  },
  xAxis: {
    categories: [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7"
    ],

    title: {
      text: "Jam"
    }
  },
  yAxis: {
    title: {
      text: "Temperature (°C)",
    },
  },
  plotOptions: {
    line: {
      dataLabels: {
        enabled: true,
      },
      enableMouseTracking: false,
    },
  },
  series: [
    {
      name: "Suhu",
      data: [
        35, 42, 61, 57, 52, 60, //insert suhu data disini
      ],
    },
  ],
});
