const fs = require("fs")
const path = require("path")
const es = require("event-stream")
const bull = require("bull")
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const lineQueue = new bull('line', 'redis://redis:6380')
let counter = 0
let pathFile
const generador = () => {
    const csvWriter = createCsvWriter({
        path: 'output.csv',
        header: [
            { id: 'id', title: 'ID' },
            { id: 'name', title: 'Name' },
            { id: 'email', title: 'Email' }
        ]
    });
    const records = [];
    for (let i = 0; i < 10 ** 7; i++) {
        records.push({
            id: i + 1,
            name: `Name: ${i + 1}`,
            email: `email${i + 1}@example${i + 1}.com`
        });
    }
    csvWriter.writeRecords(records)
        .then(() => {
            console.log('CSV file created successfully');
        })
        .catch((error) => {
            console.log(error);
        });
    pathFile = path.join(__dirname, "output.csv")
    fs.appendFileSync(pathFile, '\n');

}
const stream = (pathFile) => {
    fs.createReadStream(pathFile, "utf-8")
        .pipe(es.split()) // default split('\n')
        .on('data', (data) => {
            lineQueue.add({ data }, { attempts: 1 })
        })
}

lineQueue.process(async (job, done) => {
    setTimeout(() => {
        const { data } = job.data
        if (data.includes("example69") || data.includes("example619"))
            counter += 1
        done()
    }, 1);
    console.log(counter)

})

generador()
pathFile = path.join(__dirname, "output.csv")
stream(pathFile)