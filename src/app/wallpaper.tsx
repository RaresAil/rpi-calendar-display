import React from "react";
import "./wallpaper.css";

export class Wallpaper extends React.PureComponent<{}, { w: number }> {
  private readonly numWallpapers = 6;
  private interval: NodeJS.Timeout | undefined;

  state = {
    w: 1,
  };

  componentDidMount(): void {
    this.interval = setInterval(() => {
      if (this.state.w === this.numWallpapers) {
        this.setState({ w: 1 });
      } else {
        this.setState({
          w: this.state.w + 1,
        });
      }
    }, 60 * 1000);
  }

  componentWillUnmount(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  render(): React.ReactNode {
    return <div className={`wallpaper bg${this.state.w}`} />;
  }
}
