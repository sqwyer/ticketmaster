const express = require('express')
const app = express()
const {readFileSync, writeFileSync} = require('fs')

function rand(list) {
  const r = Math.floor(Math.random() * 50) + 1;
  if(list.includes(r)) return rand(list)
  else return r
}

function generateTicket() {
  const rows = []
  for(let i = 0; i < 10; i++) {
    let nums = [];
    for(let k = 0; k < 6; k++) {
      nums.push(rand(nums))
    }
    rows.push(nums.map(num => {return {num, calls: 0}}))
  }
  return rows;
}

app.use("/static", express.static(`${__dirname}/web/static`))

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/web/index.html`)
})

app.get("/api/tickets", (req, res) => {
  const db = readFileSync(`${__dirname}/tickets/db.json`)

  res.json(JSON.parse(db))
})

app.get("/api/generate", (req, res) => {
  const db = readFileSync(`${__dirname}/tickets/db.json`)
  const json = JSON.parse(db)

  const rows = generateTicket()
  const d = new Date();
  const hr = d.getHours();
  const min = d.getHours();
  const sec = d.getSeconds()

  const ticket = {
    "rows": rows,
    "label": `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${hr < 10 ? `0${hr}` : hr}:${min < 10 ? `0${min}` : min}:${sec < 10 ? `0${sec}` : sec}`,
    "maxCalls": 0,
    "id": json.data?.length ?? 0
  }

  json["data"].push(ticket);

  writeFileSync(`${__dirname}/tickets/db.json`, JSON.stringify(json))

  res.json(json)
})

app.get('/api/call', (req, res) => {
  const db = readFileSync(`${__dirname}/tickets/db.json`)
  const json = JSON.parse(db)

  if(req.query.ticket && req.query.num) {

    const ticket = json.data.find(self => self.id === Number(req.query.ticket));

    ticket.rows.forEach((row, rowIndex) => {
      row.forEach((num, numIndex) => {
        if(num.num === Number(req.query.num)) {
          json.data[ticket.id].rows[rowIndex][numIndex].calls++
          if(json.data[ticket.id].rows[rowIndex][numIndex].calls > ticket.maxCalls) ticket.maxCalls = json.data[ticket.id].rows[rowIndex][numIndex].calls
        }
      })
    })

    writeFileSync(`${__dirname}/tickets/db.json`, JSON.stringify(json))

    res.json(json)
  } else {
    res.json(json)
  }
})

app.listen(3000, () => {
  console.log("server running on http://localhost:3000")
})