import React from "react";
import "./index.css";

import { Wallpaper } from "./wallpaper";
import { Calendar } from "./calendar";
import { Weather } from "./weather";
import { Time } from "./time";

export class App extends React.PureComponent<{}, State> {
  private readonly DIM_TIMEOUT = 1000 * 60 * 5;

  private dimTimeout: NodeJS.Timeout | undefined;

  state = {
    dim: false,
  };

  async componentDidMount(): Promise<void> {
    this.resetDimTimeout();
  }

  componentWillUnmount(): void {
    if (this.dimTimeout) {
      clearTimeout(this.dimTimeout);
      this.dimTimeout = undefined;
    }
  }

  render(): React.ReactNode {
    return (
      <div className="app">
        <div
          onClick={this.onDimClick}
          className={["dim", this.state.dim ? "on" : "off"].join(" ")}
        ></div>
        <Wallpaper />
        <Calendar resetDimTimeout={this.resetDimTimeout} />
        <Weather />
        <Time dim={this.state.dim} />
      </div>
    );
  }

  private resetDimTimeout = () => {
    if (this.dimTimeout) {
      clearTimeout(this.dimTimeout);
    }

    this.setState({
      dim: false,
    });

    this.dimTimeout = setTimeout(() => {
      const hour = new Date().getHours();
      if (hour >= 9 && hour < 18) {
        this.resetDimTimeout();
        return;
      }

      this.setState({
        dim: true,
      });
    }, this.DIM_TIMEOUT);
  };

  private onDimClick = () => {
    this.resetDimTimeout();
  };
}

interface State {
  dim: boolean;
}
