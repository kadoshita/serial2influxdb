const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 115200 });

require('dotenv').config();

const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const client = new InfluxDB({ url: process.env.INFLUXDB_URL, token: process.env.INFLUXDB_TOKEN });

const parser = new Readline();
port.pipe(parser);

parser.on('data', line => {
    const writeApi = client.getWriteApi(process.env.INFLUXDB_ORG, process.env.INFLUXDB_BUCKET);
    const receivedObject = JSON.parse(line);
    const ts = new Date();
    const point1 = new Point('data');
    point1.timestamp(ts);
    point1.floatField('temperature', receivedObject.temperature);
    point1.floatField('pressure', receivedObject.pressure);
    point1.floatField('battery_level', receivedObject.battery_level);
    point1.tag('host', 'm5stickc');
    writeApi.writePoint(point1);

    const point2 = new Point('data');
    point2.timestamp(ts);
    point2.floatField('temperature', receivedObject.meter.temperature);
    point2.floatField('humidity', receivedObject.meter.humidity);
    point2.floatField('battery_level', receivedObject.meter.battery_level);
    point2.tag('host', 'meter');
    writeApi.writePoint(point2);

    writeApi.close()
        .catch(e => {
            console.error(e);
        });
});
