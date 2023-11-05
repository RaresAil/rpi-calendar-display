import React from "react";
import "./time.css";

export class Time extends React.PureComponent<Props, State> {
  private interval: NodeJS.Timeout | undefined;

  state: State = {
    currentTime: new Date(),
  };

  componentDidMount(): void {
    this.updateTime();
    this.interval = setInterval(this.updateTime, 500);
  }

  componentWillUnmount(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  render(): React.ReactNode {
    return (
      <div className={["time", this.props.dim ? "t-dim" : ""].join(" ")}>
        {this.state.currentTime.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    );
  }

  private updateTime = () => {
    this.setState({
      currentTime: new Date(),
    });
  };
}

interface State {
  currentTime: Date;
}

interface Props {
  dim: boolean;
}
