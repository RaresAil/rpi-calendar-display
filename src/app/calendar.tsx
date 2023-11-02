import React from "react";
import "./calendar.css";

export class Calendar extends React.PureComponent<{}, State> {
  private readonly BASE_URL = "http://127.0.0.1:8089";
  private readonly CALENDAR_UPDATE_INTERVAL = 60 * 1000;

  private interval: NodeJS.Timeout | undefined;

  state: State = {
    events: [],
  };

  async componentDidMount(): Promise<void> {
    await this.updateCalendar();
    this.interval = setInterval(
      this.updateCalendar,
      this.CALENDAR_UPDATE_INTERVAL
    );
  }

  componentWillUnmount(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
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

  private dateToLocale = (date: Date) => {
    const weekDay = date.toLocaleString("default", {
      weekday: "long",
    });
    const day = date.toLocaleString("default", {
      day: "2-digit",
    });
    const month = date.toLocaleString("default", {
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
    const result = await fetch(`${this.BASE_URL}/events`);
    const data = await result.json();
    this.setState({
      events: data,
    });
  };
}

interface State {
  events: Event[];
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
