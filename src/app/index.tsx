import React from "react";
import "./index.css";

import { Wallpaper } from "./wallpaper";
import { Calendar } from "./calendar";
import { Weather } from "./weather";

export class App extends React.PureComponent {
  render(): React.ReactNode {
    return (
      <div className="app">
        <Wallpaper />
        <Calendar />
        <Weather />
      </div>
    );
  }
}
