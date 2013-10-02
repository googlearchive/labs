(function() {

if (!window.Shuttle || Polymer.flags.mock) {
  window.Shuttle = {
    isMock: true,
    groups: [
      {
        name: 'Remote'
      },
      {
        name: 'Office'
      }
    ],
    stops: [
      {
        description: '',
        group: 0,
        in_lat: 38.15966,
        in_lon: -122.26149,
        is_work: false,
        name: 'Kimberly Park, American Canyon',
        out_lat: 38.15966,
        out_lon: -122.26149,
        short_name: 'Kimberly Park',
        trips: [0, 1, 2, 3, 4, 5]
      },
      {
        description: '',
        group: 1,
        in_lat: 37.77935,
        in_lon: -122.41874,
        is_work: true,
        name: 'San Francisco City Hall',
        out_lat: 37.77935,
        out_lon: -122.41874,
        short_name: 'City Hall',
        trips: [0, 1, 2, 3, 4, 5]
      },
      {
        description: '',
        group: 1,
        in_lat: 37.38981,
        in_lon: -122.08179,
        is_work: true,
        name: 'Mountain View City Hall',
        out_lat: 37.38981,
        out_lon: -122.08179,
        short_name: 'City Hall',
        trips: [0 , 1, 2, 3, 4, 5]
      },
      {
        description: '',
        group: 1,
        in_lat: 37.54766,
        in_lon: -122.31525,
        is_work: true,
        name: 'San Mateo City Hall',
        out_lat: 37.54766,
        out_lon: -122.31525,
        short_name: 'City Hall',
        trips: [0, 1, 2, 3, 4, 5]
      },
      {
        description: '',
        group: 0,
        in_lat: 37.60001,
        in_lon: -122.38656,
        is_work: true,
        name: 'Millbrae BART',
        out_lat: 37.60001,
        out_lon: -122.38656,
        short_name: 'Millbrae BART',
        trips: [0, 1, 2, 3, 4, 5]
      }
    ],
    trips: [
      {
        businfo: "1",
        dir: "in",
        headsign: "head",
        name: "bus 1",
        stops: [
          {
            stop: 0,
            time: "07:00 AM"
          },
          {
            stop: 1,
            time: "08:30 AM"
          },
          {
            stop: 4,
            time: "09:00 AM"
          },
          {
            stop: 3,
            time: "09:30 AM"
          },
          {
            stop: 2,
            time: "09:55 AM"
          }
        ]
      },
      {
        businfo: "2",
        dir: "out",
        headsign: "head",
        name: "Bus 2",
        stops: [
          {
            stop: 2,
            time: "03:50 PM"
          },
          {
            stop: 3,
            time: "04:10 PM"
          },
          {
            stop: 4,
            time: "04:40 PM"
          },
          {
            stop: 1,
            time: "05:10 PM"
          },
          {
            stop: 0,
            time: "06:20 PM"
          }
        ]
      },
      {
        businfo: "3",
        dir: "in",
        headsign: "head",
        name: "bus 3",
        stops: [
          {
            stop: 0,
            time: "08:00 AM"
          },
          {
            stop: 1,
            time: "09:30 AM"
          },
          {
            stop: 4,
            time: "10:00 AM"
          },
          {
            stop: 3,
            time: "10:30 AM"
          },
          {
            stop: 2,
            time: "10:55 AM"
          }
        ]
      },
      {
        businfo: "4",
        dir: "out",
        headsign: "head",
        name: "Bus 4",
        stops: [
          {
            stop: 2,
            time: "04:50 PM"
          },
          {
            stop: 3,
            time: "05:10 PM"
          },
          {
            stop: 4,
            time: "05:40 PM"
          },
          {
            stop: 1,
            time: "06:10 PM"
          },
          {
            stop: 0,
            time: "07:20 PM"
          }
        ]
      },
      {
        businfo: "5",
        dir: "in",
        headsign: "head",
        name: "bus 5",
        stops: [
          {
            stop: 0,
            time: "09:00 AM"
          },
          {
            stop: 1,
            time: "10:30 AM"
          },
          {
            stop: 4,
            time: "11:00 AM"
          },
          {
            stop: 3,
            time: "11:30 AM"
          },
          {
            stop: 2,
            time: "11:55 AM"
          }
        ]
      },
      {
        businfo: "6",
        dir: "out",
        headsign: "head",
        name: "Bus 6",
        stops: [
          {
            stop: 2,
            time: "05:50 PM"
          },
          {
            stop: 3,
            time: "06:10 PM"
          },
          {
            stop: 4,
            time: "06:40 PM"
          },
          {
            stop: 1,
            time: "07:10 PM"
          },
          {
            stop: 0,
            time: "08:20 PM"
          }
        ]
      }
    ]
  };
}

})();