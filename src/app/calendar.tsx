import React from "react";
import "./calendar.css";

export class Calendar extends React.PureComponent<{}, State> {
  private readonly CALENDAR_UPDATE_INTERVAL = 60 * 1000;

  private interval: NodeJS.Timeout | undefined;

  state: State = {
    events: [
      {
        key: "1097767/e9im6r31d5miqobjedkn6t1dcdqn6t3fdkmm8ob9dhsjkthi78ojac1i6coj8ehi60p36b9h64mj0chqc5kmoqbecdgmisj1e9in6ca0ctmm2qbc5phmur9q8h0kij2pbt442gi9ag",
        title: "🆓 📧 Morning Catch Up",
        eventStart: "2023-11-02T09:00:00.000+02:00",
        eventEnd: "2023-11-02T09:30:00.000+02:00",
        requiresTravel: false,
        rsvpStatus: RsvpStatus.None,
        organizer: "ailincairares1@gmail.com",
        onlineMeetingUrl: "",
      },
      {
        key: "1097769/e9im6r31d5miqobjedkn6t1dcdqn6t3fdkmm8ob9dhsjkthi78ojac1i6coj8ehi60p36b9h64mj0chqc5kmoqbecdgmisj1e9in6ca0ctmm2qbc5phmur9q8h0kij2pbt442gi9ag",
        title: "🆓 📧 Morning Catch Up",
        eventStart: "2023-11-02T09:00:00.000+02:00",
        eventEnd: "2023-11-02T09:30:00.000+02:00",
        requiresTravel: false,
        rsvpStatus: RsvpStatus.None,
        organizer: "ailincairares1@gmail.com",
        onlineMeetingUrl: "",
      },
      {
        key: "2197769/e9im6r31d5miqobjedkn6t1dcdqn6t3fdkmm8ob9dhsjkthi78ojac1i6coj8ehi60p36b9h64mj0chqc5kmoqbecdgmisj1e9in6ca0ctmm2qbc5phmur9q8h0kij2pbt442gi9ag",
        title: "🆓 📧 Morning Catch Up",
        eventStart: "2023-11-03T09:00:00.000+02:00",
        eventEnd: "2023-11-03T09:30:00.000+02:00",
        requiresTravel: false,
        rsvpStatus: RsvpStatus.None,
        organizer: "ailincairares1@gmail.com",
        onlineMeetingUrl: "",
      },
    ],
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
              <div className="event">
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

  private updateCalendar = async (): Promise<void> => {};
}

interface State {
  events: Event[];
}

enum RsvpStatus {
  None = "None",
  Accepted = "Accepted",
  Declined = "Declined",
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
