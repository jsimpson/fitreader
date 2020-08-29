class Lap {
  timestamp: string;
  startTime: string;
  startPositionLat: number;
  startPositionLong: number;
  endPositionLat: number;
  endPositionLong: number;
  totalElapsedTime: string;
  totalTimerTime: string;
  totalDistance: number;
  totalCycles: number;
  necLat: number;
  necLong: number;
  swcLat: number;
  swcLong: number;
  enhancedAvgSpeed: number;
  enhancedMaxSpeed: number;
  messageIndex: number;
  totalCalories: number;
  totalAscent: number;
  totalDescent: number;
  avgHeartRate: number;
  maxHeartRate: number;
  avgCadence: number;
  maxCadence: number;
  avgFractionalCadence: number;
  maxFractionalCadence: number;

  constructor(lap: { [index: string]: any }) {
    this.timestamp = lap["timestamp"];
    this.startTime = lap["startTime"];
    this.startPositionLat = lap["startPositionLat"];
    this.startPositionLong = lap["startPositionLong"];
    this.endPositionLat = lap["endPositionLat"];
    this.endPositionLong = lap["endPositionLong"];
    this.totalElapsedTime = lap["totalElapsedTime"];
    this.totalTimerTime = lap["totalTimerTime"];
    this.totalDistance = lap["totalDistance"];
    this.totalCycles = lap["totalCycles"];
    this.necLat = lap["necLat"];
    this.necLong = lap["necLong"];
    this.swcLat = lap["swcLat"];
    this.swcLong = lap["swcLong"];
    this.enhancedAvgSpeed = lap["enhancedAvgSpeed"];
    this.enhancedMaxSpeed = lap["enhancedMaxSpeed"];
    this.messageIndex = lap["messageIndex"];
    this.totalCalories = lap["totalCalories"];
    this.totalAscent = lap["totalAscent"];
    this.totalDescent = lap["totalDescent"];
    this.avgHeartRate = lap["avgHeartRate"];
    this.maxHeartRate = lap["maxHeartRate"];
    this.avgCadence = lap["avgCadence"];
    this.maxCadence = lap["maxCadence"];
    this.avgFractionalCadence = lap["avgFractionalCadence"];
    this.maxFractionalCadence = lap["maxFractionalCadence"];
  }
}

class Trackpoint {
  timestamp: string;
  latitude: number;
  longitude: number;
  distance: number;
  speed: number;
  elevation: number;
  heartRate: number;
  cadence: number;
  fractionalCadence: number;

  constructor(trackpoint: { [index: string]: any }) {
    this.timestamp = trackpoint["timestamp"];
    this.latitude = trackpoint["positionLat"];
    this.longitude = trackpoint["positionLong"];
    this.distance = trackpoint["distance"];
    this.speed = trackpoint["enhancedSpeed"];
    this.elevation = trackpoint["enhancedAltitude"];
    this.heartRate = trackpoint["heartRate"];
    this.cadence = trackpoint["cadence"];
    this.fractionalCadence = trackpoint["fractionalCadence"];
  }
}

export class Activity {
  laps: Lap[];
  trackpoints: Trackpoint[];

  constructor(fit: any) {
    let lapMessage = fit.messages.filter((message: any) => {
      if (message.name === "lap") {
        return message;
      }
    });

    let recordMessage = fit.messages.filter((message: any) => {
      if (message.name === "record") {
        return message;
      }
    });

    this.laps = lapMessage[0].data.map((lap: any) => {
      return new Lap(lap);
    });

    this.trackpoints = recordMessage[0].data.map((trackpoint: any) => {
      return new Trackpoint(trackpoint);
    });
  }

  async dump(filename?: string): Promise<void> {
    if (filename === undefined) {
      filename = `${this.laps[0]["timestamp"]}.json`;
    }
    await Deno.writeTextFile(filename, JSON.stringify(this));
  }
}
