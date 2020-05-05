const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 115200 });

require('dotenv').config();

const { InfluxDB } = require('@influxdata/influxdb-client');
const client = new InfluxDB({ url: process.env.INFLUXDB_URL, token: process.env.INFLUXDB_TOKEN });

const parser = new Readline();
port.pipe(parser);

parser.on('data', line => {
    const writeApi = client.getWriteApi(process.env.INFLUXDB_ORG_ID, process.env.INFLUXDB_BUCKET);
    const receivedObject = JSON.parse(line);
    const data = `room_env,host=m5stickc temperature=${receivedObject.temperature},pressure=${receivedObject.pressure},battery_level=${receivedObject.battery_level}`;
    writeApi.writeRecord(data);
    writeApi.close()
        .catch(e => {
            console.error(e);
        });
});