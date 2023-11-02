import React from "react";

const mock = {
  latitude: 47.1875,
  longitude: 27.625,
  generationtime_ms: 0.06008148193359375,
  utc_offset_seconds: 0,
  timezone: "GMT",
  timezone_abbreviation: "GMT",
  elevation: 72.0,
  current_units: {
    time: "unixtime",
    interval: "seconds",
    temperature_2m: "°C",
    relativehumidity_2m: "%",
    weathercode: "wmo code",
  },
  current: {
    time: 1698925500,
    interval: 900,
    temperature_2m: 13.4,
    relativehumidity_2m: 72,
    weathercode: 3,
  },
  hourly_units: {
    time: "unixtime",
    temperature_2m: "°C",
    relativehumidity_2m: "%",
    weathercode: "wmo code",
  },
  hourly: {
    time: [
      1698883200, 1698886800, 1698890400, 1698894000, 1698897600, 1698901200,
      1698904800, 1698908400, 1698912000, 1698915600, 1698919200, 1698922800,
      1698926400, 1698930000, 1698933600, 1698937200, 1698940800, 1698944400,
      1698948000, 1698951600, 1698955200, 1698958800, 1698962400, 1698966000,
      1698969600, 1698973200, 1698976800, 1698980400, 1698984000, 1698987600,
      1698991200, 1698994800, 1698998400, 1699002000, 1699005600, 1699009200,
      1699012800, 1699016400, 1699020000, 1699023600, 1699027200, 1699030800,
      1699034400, 1699038000, 1699041600, 1699045200, 1699048800, 1699052400,
      1699056000, 1699059600, 1699063200, 1699066800, 1699070400, 1699074000,
      1699077600, 1699081200, 1699084800, 1699088400, 1699092000, 1699095600,
      1699099200, 1699102800, 1699106400, 1699110000, 1699113600, 1699117200,
      1699120800, 1699124400, 1699128000, 1699131600, 1699135200, 1699138800,
    ],
    temperature_2m: [
      7.8, 7.3, 7.2, 6.6, 6.3, 6.3, 6.6, 8.4, 9.9, 11.2, 12.7, 13.3, 13.5, 13.3,
      12.7, 11.5, 10.6, 10.1, 9.7, 9.3, 9.1, 9.2, 9.7, 10.5, 10.8, 10.7, 11.0,
      11.3, 11.4, 11.5, 11.9, 13.1, 14.5, 15.7, 16.5, 17.5, 18.1, 18.3, 17.8,
      16.7, 16.2, 15.8, 15.6, 15.5, 15.4, 15.6, 15.4, 15.4, 15.3, 15.4, 15.5,
      15.7, 15.9, 15.8, 15.9, 16.4, 17.3, 17.7, 17.9, 18.6, 19.1, 19.4, 19.0,
      18.3, 17.8, 17.5, 16.8, 17.6, 17.5, 17.4, 17.0, 16.5,
    ],
    relativehumidity_2m: [
      93, 92, 89, 90, 91, 90, 91, 86, 83, 90, 79, 75, 71, 69, 75, 82, 86, 89,
      89, 89, 90, 90, 92, 91, 91, 93, 92, 91, 91, 92, 91, 88, 83, 77, 72, 68,
      65, 64, 67, 73, 72, 77, 82, 86, 88, 88, 89, 90, 92, 94, 95, 95, 95, 95,
      95, 93, 88, 85, 84, 79, 76, 77, 81, 83, 83, 87, 96, 91, 88, 85, 85, 85,
    ],
    weathercode: [
      0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 1, 1, 1, 2, 3, 3, 3,
      2, 2, 2, 2, 3, 2, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1, 3, 3, 3, 3, 61, 61, 61,
      51, 51, 3, 3, 3, 3, 3, 3, 3, 80, 2, 3, 3, 3, 80, 3, 80, 63, 61, 3, 3, 3,
      3,
    ],
  },
};

export class Weather extends React.PureComponent<{}, State> {
  private hInterval: NodeJS.Timeout | undefined;
  private dInterval: NodeJS.Timeout | undefined;

  state: State = {
    currentTimeS: "",
    current: {
      temperature: 0,
      humidity: 0,
      weathercode: 0,
    },
    daily: [],
    hourly: {},
  };

  async componentDidMount(): Promise<void> {
    this.setState({
      currentTimeS: this.getHourlyKey(new Date()),
    });

    await this.loadWeatherData();
    this.dInterval = setInterval(this.loadWeatherData, 86400000);
    this.hInterval = setInterval(this.updateHourlyData, 3600000);
  }

  componentWillUnmount(): void {
    if (this.hInterval) {
      clearInterval(this.hInterval);
      this.hInterval = undefined;
    }

    if (this.dInterval) {
      clearInterval(this.dInterval);
      this.dInterval = undefined;
    }
  }

  render(): React.ReactNode {
    console.log(this.getHourlyData(this.state.currentTimeS));
    return <></>;
  }

  private parseData = (data: any) => {
    const currentData: WeatherData = {
      temperature: Math.round(data.current.temperature_2m),
      humidity: Math.round(data.current.relativehumidity_2m),
      weathercode: data.current.weathercode,
    };

    const hourlyData: Record<string, WeatherData> = {};
    const dailyData: Record<string, Daily> = data.hourly.time.reduce(
      (acc: Record<string, Daily>, timeS: any, i: number) => {
        const time = new Date(timeS * 1000).toLocaleString("default", {
          month: "long",
          day: "2-digit",
          year: "numeric",
        });

        if (acc[time]) {
          acc[time].min.temperature = Math.min(
            acc[time].min.temperature,
            data.hourly.temperature_2m[i]
          );
          acc[time].max.temperature = Math.max(
            acc[time].max.temperature,
            data.hourly.temperature_2m[i]
          );
          acc[time].min.humidity = Math.min(
            acc[time].min.humidity,
            data.hourly.relativehumidity_2m[i]
          );
          acc[time].max.humidity = Math.max(
            acc[time].max.humidity,
            data.hourly.relativehumidity_2m[i]
          );
          acc[time].min.weathercode = Math.min(
            acc[time].min.weathercode,
            data.hourly.weathercode[i]
          );
          acc[time].max.weathercode = Math.max(
            acc[time].max.weathercode,
            data.hourly.weathercode[i]
          );
        } else {
          acc[time] = {
            date: new Date(timeS * 1000),
            max: {
              temperature: data.hourly.temperature_2m[i],
              humidity: data.hourly.relativehumidity_2m[i],
              weathercode: data.hourly.weathercode[i],
            },
            min: {
              temperature: data.hourly.temperature_2m[i],
              humidity: data.hourly.relativehumidity_2m[i],
              weathercode: data.hourly.weathercode[i],
            },
          };
        }

        const hour = this.getHourlyKey(new Date(timeS * 1000));
        hourlyData[hour] = {
          temperature: Math.round(data.hourly.temperature_2m[i]),
          humidity: Math.round(data.hourly.relativehumidity_2m[i]),
          weathercode: data.hourly.weathercode[i],
        };

        return acc;
      },
      {}
    );

    this.setState({
      current: currentData,
      daily: Object.values(dailyData).map((d) => ({
        date: d.date,
        max: {
          temperature: Math.round(d.max.temperature),
          humidity: Math.round(d.max.humidity),
          weathercode: d.max.weathercode,
        },
        min: {
          temperature: Math.round(d.min.temperature),
          humidity: Math.round(d.min.humidity),
          weathercode: d.min.weathercode,
        },
      })),
      hourly: hourlyData,
    });
  };

  private getHourlyKey = (date: Date): string => {
    return date.toLocaleString("default", {
      month: "long",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
    });
  };

  private getHourlyData = (key?: string): WeatherData => {
    const current = this.state.hourly[key || this.getHourlyKey(new Date())];
    if (!current) {
      return {
        temperature: this.state.current.temperature,
        weathercode: this.state.current.weathercode,
        humidity: this.state.current.humidity,
      };
    }

    return {
      temperature: current.temperature,
      weathercode: current.weathercode,
      humidity: current.humidity,
    };
  };

  private loadWeatherData = async () => {
    this.parseData(mock);
  };

  private updateHourlyData = async () => {
    this.setState({
      currentTimeS: this.getHourlyKey(new Date()),
    });
  };
}

interface WeatherData {
  temperature: number;
  weathercode: number;
  humidity: number;
}

interface Daily {
  max: WeatherData;
  min: WeatherData;
  date: Date;
}

interface State {
  currentTimeS: string;
  hourly: Record<string, WeatherData>;
  current: WeatherData;
  daily: Daily[];
}
