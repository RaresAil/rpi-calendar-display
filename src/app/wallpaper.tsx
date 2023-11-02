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
    return (
      <div className="wallpapers">
        {Array.from(Array(this.numWallpapers).keys()).map((i) => {
          const n = i + 1;
          return (
            <div
              key={n}
              className={`wallpaper bg${n} ${
                this.state.w === n ? "active" : ""
              }`}
            />
          );
        })}
      </div>
    );
  }
}
