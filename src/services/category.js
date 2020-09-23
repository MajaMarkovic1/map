export default class Category {
  constructor() {
    this.projectPOI = {};
    this.categories = [];
    this.poi = {};
    this.i = 0;
  }

  getClusterColor() {
    // marker colors
    const transparency = 0.6;
    let arr = [
      `rgba(255, 0, 0, ${transparency})`, //red
      `rgba(155, 0, 0, ${transparency})`, //red
      `rgba(55, 0, 0, ${transparency})`, //red
      `rgba(255, 55, 0, ${transparency})`, //red
      `rgba(255, 155, 0, ${transparency})`, //orange
      `rgba(55, 155, 0, ${transparency})`, //green
      `rgba(255, 255, 0, ${transparency})`, //yellow
      `rgba(155, 155, 0, ${transparency})` //green

      // "rgba(0,150,255,0.7)", // blue
      // "rgba(0,150,0,0.7)", //green
      // "rgba(255,150,0,0.9)", //red
      // "rgba(150,0,255,0.7)", // blue
      // "rgba(0,150,150,0.7)", //green
      // "rgba(255,0,150,0.7)", //red
      // "rgba(150,0,255,0.7)" //green
    ];
    let color = arr[this.i];
    this.i  = (this.i + 1 ) % arr.length;
    return color;
  }

  checkIfOpened(poi, singleDay = false) {
    if (!poi.opening_hours) return null;

    let openingHours = poi.opening_hours;
    let date = new Date();
    let totalMinutes = date.getHours() * 60 + date.getMinutes();

    let todaysHours = singleDay ? openingHours : openingHours[openingHours.weekday];
    if (todaysHours.length === 0)
      return false;

    let parseTime = function(str) {
      let chunks = str.split(":");
      return parseInt(chunks[0], 10) * 60 + parseInt(chunks[0], 10);
    };

    for (let span of todaysHours) {
      let begin = parseTime(span[0]);
      let end = parseTime(span[1]);
      // wrap around to the next day
      if(end < begin)
        end += 24*60;
      if (totalMinutes >= begin && totalMinutes <= end) return true;
    }
    return false;
  }
}
export const categoryService = new Category();
