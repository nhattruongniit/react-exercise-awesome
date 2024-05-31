/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

import {
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import { Col, Statistic, Row, Spin, Table, Empty } from "antd";
import { useColorContext } from "@src/contexts/color-context";
import {
  blue,
  red,
  green,
  lime,
  cyan,
  purple,
  magenta,
} from "@ant-design/colors";
import { config } from "@src/config";
// import moment from "moment";
// import dayjs from "dayjs";

function getColor(i: any, mode: string) {
  const colorPalettes = [blue, red, green, lime, cyan, purple, magenta];
  const selectedColorPalette = colorPalettes[i % colorPalettes.length];

  //todo: handle dark mode
  console.log("mode: ", mode);
  const selectedToneIndex = 4 + Math.floor(i / (colorPalettes.length - 4));
  return selectedColorPalette[selectedToneIndex];
}

const numberFormatter = (item: string) => item.toLocaleString();
// const dateFormatter = (item: any) => dayjs(item).format("YYYY-MM-DD");
// const xAxisFormatter = (item: any) => {
//   if (moment(item).isValid()) {
//     return dateFormatter(item);
//   } else {
//     return item;
//   }
// };

const CartesianChart = ({
  resultSet,
  children,
  pivotConfig,
  ChartComponent,
}: any) => {
  return (
    <div className="p-4 h-full" style={{ height: config.RECHART_HEIGHT }}>
      <ResponsiveContainer width="100%" height="90%">
        <ChartComponent
          data={resultSet.chartPivot(pivotConfig)}
          margin={{
            top: 10,
            right: 40,
            left: 40,
            bottom: 0,
          }}
        >
          <XAxis
            axisLine={false}
            tickLine={false}
            dataKey="x"
            minTickGap={20}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={numberFormatter}
          />
          <Tooltip formatter={numberFormatter} />
          <CartesianGrid />
          {children}
          <Legend />
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const TypeToChartComponent: any = {
  line: ({ resultSet, pivotConfig, mode }: any) => {
    console.log("line chart: ", {
      resultSet,
      seriesNames: resultSet.seriesNames(),
      pivotConfig,
      dataChart: resultSet.chartPivot(pivotConfig),
    });
    return (
      <CartesianChart
        resultSet={resultSet}
        pivotConfig={pivotConfig}
        ChartComponent={LineChart}
      >
        {resultSet.seriesNames().map((series: any, i: number) => {
          return (
            <Line
              key={series.key}
              dataKey={series.key}
              name={series.title}
              stroke={getColor(i, mode)}
              strokeWidth={3}
            />
          );
        })}
      </CartesianChart>
    );
  },
  bar: ({ resultSet, pivotConfig, mode }: any) => (
    <CartesianChart
      resultSet={resultSet}
      pivotConfig={pivotConfig}
      ChartComponent={BarChart}
    >
      {resultSet.seriesNames().map((series: any, i: number) => {
        return (
          <Bar
            key={series.key}
            stackId="a"
            dataKey={series.key}
            name={series.title}
            fill={getColor(i, mode)}
          />
        );
      })}
    </CartesianChart>
  ),
  area: ({ resultSet, pivotConfig, mode }: any) => (
    <CartesianChart
      resultSet={resultSet}
      pivotConfig={pivotConfig}
      ChartComponent={AreaChart}
    >
      {resultSet.seriesNames().map((series: any, i: number) => (
        <Area
          key={series.key}
          stackId="a"
          dataKey={series.key}
          name={series.title}
          stroke={getColor(i, mode)}
          fill={getColor(i, mode)}
        />
      ))}
    </CartesianChart>
  ),
  pie: ({ resultSet, pivotConfig, mode }: any) => (
    <div className="h-full" style={{ height: config.RECHART_HEIGHT }}>
      <ResponsiveContainer width="100%" height="90%" className="pie">
        <PieChart>
          <Pie
            data={resultSet.chartPivot(pivotConfig)}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={120}
            fill="#8884d8"
            nameKey="x"
            dataKey={resultSet.seriesNames()[0].key}
          >
            {resultSet.chartPivot().map((_: any, i: number) => (
              <Cell key={i} fill={getColor(i, mode)} />
            ))}
          </Pie>
          <Legend />
          <Tooltip formatter={numberFormatter} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  ),
  number: ({ resultSet }: any) => (
    <Row
      justify="center"
      align="middle"
      style={{
        height: config.RECHART_HEIGHT,
        overflow: "auto",
      }}
    >
      <Col>
        {resultSet.seriesNames().map((s: any) => (
          <Statistic value={resultSet.totalRow()[s.key]} />
        ))}
      </Col>
    </Row>
  ),
  table: ({ resultSet, pivotConfig }: any) => {
    const countColumn = resultSet.tableColumns().length;
    return (
      <div className="table-amanotes">
        <Table
          size="small"
          dataSource={resultSet.tablePivot(pivotConfig)}
          columns={resultSet.tableColumns(pivotConfig)}
          scroll={{ x: countColumn >= 6 ? 600 * countColumn : 1200, y: 280 }}
          pagination={false}
        />
      </div>
    );
  },
};
const TypeToMemoChartComponent = Object.keys(TypeToChartComponent)
  .map((key) => ({
    [key]: React.memo(TypeToChartComponent[key]),
  }))
  .reduce((a, b) => ({ ...a, ...b }));

const renderChart =
  (Component: any) =>
  ({ resultSet, isLoading, error, pivotConfig, ...props }: any) => {
    if (isLoading)
      return (
        <div className="flex items-center justify-center w-full h-full">
          <Spin />
        </div>
      );

    if (!resultSet || error) {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      );
    }

    return (
      <>
        {resultSet && (
          <Component
            resultSet={resultSet}
            pivotConfig={pivotConfig}
            {...props}
          />
        )}
      </>
    );
    // (resultSet && <Component resultSet={resultSet} {...props} />) ||
    // (error && error.toString()) || (
    //   <div className="flex items-center justify-center w-full h-full">
    //     <Spin />
    //   </div>
    // );
  };

type IProps = {
  vizState: any;
  renderProps: any;
};

const ChartRenderer = ({ vizState, renderProps }: IProps) => {
  const { mode } = useColorContext();
  const {
    // query,
    chartType,
    ...options
  } = vizState;
  const component = TypeToMemoChartComponent[chartType];
  // const renderProps = useCubeQuery(query);
  return (
    component && renderChart(component)({ ...options, ...renderProps, mode })
  );
};

export default ChartRenderer;
