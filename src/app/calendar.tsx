import { parseCronExpression } from "cron-schedule";
import React from "react";

import "./calendar.css";

export class Calendar extends React.PureComponent<Props, State> {
  private readonly CRON = parseCronExpression("* * * * *");
  private readonly BASE_URL = "http://127.0.0.1:8089";

  private nodeTimeout: NodeJS.Timeout | undefined;
  private updating = false;

  state: State = {
    events: [],
  };

  async componentDidMount(): Promise<void> {
    await this.updateCalendar();
    this.processTimeout();
  }

  componentWillUnmount(): void {
    if (this.nodeTimeout) {
      clearTimeout(this.nodeTimeout);
      this.nodeTimeout = undefined;
    }
  }

  render() {
    let currentTitleHash = "";
    return (
      <div className="calendar">
        {this.state.events.map((event) => {
          const eventStart = new Date(event.eventStart);
          const { hash, node: TitleNode } = this.dateToLocale(eventStart);

          const addTitle = currentTitleHash !== hash;
          currentTitleHash = hash;
          return (
            <React.Fragment key={event.key}>
              {addTitle ? <TitleNode /> : <></>}
              <div className={`event ${event.rsvpStatus}`}>
                <span />
                <span>
                  {eventStart.getHours().toString().padStart(2, "0")}:
                  {eventStart.getMinutes().toString().padStart(2, "0")}
                </span>
                <span>{event.title}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  private processTimeout = async (timeout: number = 0) => {
    if (timeout > 30 * 1000) {
      await this.updateCalendar();
    }

    const nextTimeout = this.CRON.getNextDate().getTime() - Date.now();
    this.nodeTimeout = setTimeout(() => {
      this.processTimeout(nextTimeout);
    }, nextTimeout);
  };

  private dateToLocale = (date: Date) => {
    const weekDay = date.toLocaleString("en-GB", {
      weekday: "long",
    });
    const day = date.toLocaleString("en-GB", {
      day: "2-digit",
    });
    const month = date.toLocaleString("en-GB", {
      month: "long",
    });

    const isToday =
      date.getDate() === new Date().getDate() &&
      date.getMonth() === new Date().getMonth() &&
      date.getFullYear() === new Date().getFullYear();

    const hash = `${weekDay}${day}${month}${date.getFullYear()}`;

    return {
      hash,
      node: () => (
        <div className="event-title-date">
          <span>{day}</span> {isToday ? "Today" : `${month}, ${weekDay}`}
        </div>
      ),
    };
  };

  private updateCalendar = async (): Promise<void> => {
    if (this.updating) {
      return;
    }
    this.updating = true;

    try {
      const result = await fetch(`${this.BASE_URL}/events`);
      const data = await result.json();

      if (this.state.events.length !== data.length) {
        this.props.resetDimTimeout();
      }

      this.setState({
        events: data,
      });
    } catch {}

    this.updating = false;
  };
}

interface State {
  events: Event[];
}

interface Props {
  resetDimTimeout: () => void;
}

enum RsvpStatus {
  None = "None",
  Accepted = "Accepted",
  Declined = "Declined",
  Maybe = "Maybe",
}

interface Event {
  key: string;
  title: string;
  eventStart: string;
  eventEnd: string;
  rsvpStatus: RsvpStatus;
  organizer: string;
  onlineMeetingUrl: string;
  requiresTravel: boolean;
}
