let currentTicket = null;

function updateList(fulldb) {
  const { data: db } = fulldb;
  const listDiv = document.getElementById("ticketList");
  listDiv.innerHTML = '<button onClick="newTicket()" id="genticket">Generate New Ticket</button>'
  for(let i = 0; i < db.length; i++) {
    const { label } = db[i]
    const ticketButton = document.createElement("button")
    ticketButton.setAttribute("style", "width: 100%; padding: 2px; text-align: center;")
    ticketButton.onclick = () => selectTicket(db[i])
    ticketButton.innerText = label;
    listDiv.appendChild(ticketButton)
  }
}

function selectTicket(ticket) {
  const {rows, maxCalls} = ticket;
  const ticketDiv = document.getElementById("currentTicket")
  currentTicket = ticket;
  ticketDiv.innerHTML = ""
  // ticketDiv.childNodes.forEach(child => child.remove())
  for(let i = 0; i < rows.length; i++) {
    const rowElem = document.createElement("div")
    rowElem.id = `row-${i}`
    rowElem.setAttribute("style", "display: flex; flex-direction: row; border: 2px solid white;")
    for(let k = 0; k < rows[i].length; k++) {
      const num = rows[i][k].num;
      const calls = rows[i][k].calls;
      const numElem = document.createElement("div")
      // console.log(calls, maxCalls, calls/maxCalls)
      numElem.setAttribute("style", `padding: 6px; font-family: sans-serif; font-size: 16px; background: rgba(22, 215, 51, ${calls/maxCalls})`)
      numElem.id = `row-${i}-col-${k}`
      numElem.classList.add("num")
      if(num < 10) numElem.innerText = "0" + num.toString()
      else numElem.innerText = num.toString()
      rowElem.appendChild(numElem)
    }
    ticketDiv.appendChild(rowElem)
  }
}

(async function(){
  await fetch("/api/tickets")
    .then(res => res.json())
    .then(db => {
      if(db.data.length != 0 ) selectTicket(db["data"][db["data"].length-1])
      updateList(db)
    })
    .catch(err => console.error(err))
})()

async function newTicket() {
  await fetch("/api/generate")
    .then(res => res.json())
    .then(db => {
      selectTicket(db["data"][db["data"].length-1])
      updateList(db)
    })
    .catch(err => console.error(err))
}

let currentCall = [];

async function callNum(num) {
  const allCallsDiv = document.getElementById("allCalls")
  if(currentCall.length >= 6) return;
  else {
    await fetch(`/api/call?num=${num}&ticket=${currentTicket.id}`)
      .then(res => res.json())
      .then(db => {
        currentCall.push(num);
        document.getElementById("callInput").value = ""
        const currentCallElem = document.createElement("div")
        currentCallElem.setAttribute("style", `padding: 6px; font-family: sans-serif; font-size: 16px;`)
        if(num < 10) currentCallElem.innerText = "0" + num.toString();
        else currentCallElem.innerText = num.toString();
        allCallsDiv.appendChild(currentCallElem)
        selectTicket(db["data"][currentTicket.id])
        currentTicket.rows.forEach((row, index) => {
          let rowNums = row.map(num => num.num)
          let success = true;

          currentCall.forEach(call => {
            if(!rowNums.includes(call)) success = false;
          })
  
    
          if(success) document.getElementById(`row-${index}`).style.border = "2px solid orange"
          else document.getElementById(`row-${index}`).style.border = "2px solid white"
        })
        updateList(db)
      })
      .catch(err => console.error(err))
  }
}

function clearTicket() {
  const allCallsDiv = document.getElementById("allCalls")
  allCallsDiv.innerHTML = ''
  currentCall = [];
  for(let i = 0; i < 10; i++) {
    document.getElementById(`row-${i}`).style.border = "2px solid white"
  }
}

document.getElementById("callInput").onkeyup = (event) => {
  if(event.keyCode === 13) callNum(Number(document.getElementById("callInput").value))
}