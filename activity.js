class Lap {
  constructor(lap) {
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
    this.event = lap["event"];
    this.eventType = lap["eventType"];
    this.avgHeartRate = lap["avgHeartRate"];
    this.maxHeartRate = lap["maxHeartRate"];
    this.avgCadence = lap["avgCadence"];
    this.maxCadence = lap["maxCadence"];
    this.lapTrigger = lap["lapTrigger"];
    this.sport = lap["sport"];
    this.subSport = lap["subSport"];
    this.avgFractionalCadence = lap["avgFractionalCadence"];
    this.maxFractionalCadence = lap["maxFractionalCadence"];
  }
}

class Trackpoint {
  constructor(trackpoint) {
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
  constructor(fit) {
    let lapMessage = fit.messages.filter((message) => {
      if (message.name === "lap") {
        return message;
      }
    });

    let recordMessage = fit.messages.filter((message) => {
      if (message.name === "record") {
        return message;
      }
    });

    this.laps = lapMessage[0].data.map((lap) => {
      return new Lap(lap);
    });

    this.trackpoints = recordMessage[0].data.map((trackpoint) => {
      return new Trackpoint(trackpoint);
    });
  }

  async dump(filename) {
    if (filename === undefined) {
      filename = `${this.laps[0]["timestamp"]}.json`;
    }
    await Deno.writeTextFile(filename, JSON.stringify(this));
  }
}
