import { Cron, parseCronExpression } from "cron-schedule";
import React from "react";

import "./weather.css";

const Icons = require("@intern0t/react-weather-icons");

export class Weather extends React.PureComponent<{}, State> {
  private readonly HOUR_CRON = parseCronExpression("0 * * * *");
  private readonly DAY_CRON = parseCronExpression("0 0 * * *");
  private readonly UNIT_TEMP = "°C";

  private hTimeout: NodeJS.Timeout | undefined;
  private dTimeout: NodeJS.Timeout | undefined;

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

    this.dTimeout = await this.processTimeout(
      0,
      this.DAY_CRON,
      this.loadWeatherData
    );
    this.hTimeout = await this.processTimeout(
      0,
      this.HOUR_CRON,
      this.updateHourlyData
    );
  }

  componentWillUnmount(): void {
    if (this.hTimeout) {
      clearInterval(this.hTimeout);
      this.hTimeout = undefined;
    }

    if (this.dTimeout) {
      clearInterval(this.dTimeout);
      this.dTimeout = undefined;
    }
  }

  render(): React.ReactNode {
    const current = this.getHourlyData(this.state.currentTimeS);
    const CurrentIcon = this.getIcon(current.weathercode);
    return (
      <div className="weather">
        <div className="c-weather">
          <span>
            {current.temperature} {this.UNIT_TEMP}
          </span>
          <CurrentIcon color="#fff" size={60} />
        </div>
        <div className="del-weather" />
        <div className="d-weather">
          {this.state.daily.map((daily) => {
            const DailyIcon = this.getIcon(daily.max.weathercode);
            const weekDay = daily.date.toLocaleDateString("default", {
              weekday: "short",
            });
            const isToday =
              weekDay ===
              new Date().toLocaleDateString("default", {
                weekday: "short",
              });

            return (
              <div key={daily.date.getTime()}>
                <span>{isToday ? "Today" : weekDay}</span>
                <DailyIcon color="#fff" size={40} />
                <span>
                  {daily.max.temperature} {this.UNIT_TEMP}{" "}
                  {daily.min.temperature} {this.UNIT_TEMP}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
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
    const result = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${process.env.REACT_APP_LAT}&longitude=${process.env.REACT_APP_LONG}&current=temperature_2m,relativehumidity_2m,weathercode&hourly=temperature_2m,relativehumidity_2m,weathercode&timeformat=unixtime&timezone=GMT&forecast_days=3`,
      {
        method: "GET",
      }
    );

    const data = await result.json();
    this.parseData(data);
  };

  private updateHourlyData = async () => {
    this.setState({
      currentTimeS: this.getHourlyKey(new Date()),
    });
  };

  private getIcon = (code: number): any => {
    if (code >= 20 && code <= 29) {
      return Icons.Showers;
    }

    if (code >= 36 && code <= 39) {
      return Icons.NightSleet;
    }

    if ((code >= 40 && code <= 49) || (code >= 4 && code <= 19)) {
      return Icons.Fog;
    }

    if (code >= 50 && code <= 59) {
      return Icons.Raindrops;
    }

    if ((code >= 70 && code <= 75) || (code >= 77 && code <= 79)) {
      return Icons.SnowflakeCold;
    }

    if (code === 76) {
      return Icons.Dust;
    }

    if (
      (code >= 60 && code <= 67) ||
      (code >= 80 && code <= 83) ||
      code === 91 ||
      code === 92
    ) {
      return Icons.Rain;
    }

    if (code === 84 || code === 68 || code === 69) {
      return Icons.RainMix;
    }

    if (code >= 85 && code <= 90) {
      return Icons.SnowWind;
    }

    if (code === 93 || code === 94 || code === 99 || code === 96) {
      return Icons.Hail;
    }

    if (code === 95) {
      return Icons.Thunderstorm;
    }

    if (code === 97) {
      return Icons.NightSnowThunderstorm;
    }

    if (code === 98 || (code >= 30 && code <= 35)) {
      return Icons.Sandstorm;
    }

    return Icons.DaySunny;
  };

  private processTimeout = async (
    timeout: number = 0,
    cron: Cron,
    method: () => Promise<void>
  ) => {
    if (timeout > 120 * 1000) {
      await method();
    }

    const nextTimeout = cron.getNextDate().getTime() - Date.now();
    return setTimeout(() => {
      this.processTimeout(nextTimeout, cron, method);
    }, nextTimeout);
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
