import React from "react";
import "./index.css";

import { Wallpaper } from "./wallpaper";
import { Calendar } from "./calendar";
import { Weather } from "./weather";
import { Time } from "./time";

export class App extends React.PureComponent {
  render(): React.ReactNode {
    return (
      <div className="app">
        <Wallpaper />
        <Calendar />
        <Weather />
        <Time />
      </div>
    );
  }
}
