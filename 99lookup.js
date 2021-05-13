
function getTeamID() {
  const regex = /.*:\/\/liga.99damage.de\/de\/leagues\/teams\/(\d+).*/i;
  const  matches = window.location.href.match(regex);
  if (matches.length === 2) {
    return matches[1];
  }
  return null;
}

function getTeamName() {
  const text = document.querySelector('.page-title').innerText;
  const regex = /.*\((.*)\)/i;
  const  matches = text.match(regex);
  if (matches.length === 2) {
    return matches[1];
  }
  return null;
}

function getMatches() {
  const matchIDs = [];

  const text = document.querySelector('.league-stage-matches').innerHTML;
  const regex = /.*:\/\/liga.99damage.de\/de\/leagues\/matches\/(\d+).*/g;
  const matches = text.matchAll(regex);
  for (const match of matches) {
    if (match.length === 2) {
      if (!matchIDs.includes(match[1])) {
        matchIDs.push(match[1]);
      }
    }
  }
  return matchIDs;
}

function getMapName(list, id) {
  return list.find(map => map.id === id).title;
}

function getMatchInfo(matchID, teamName) {
  let bans = [];

  fetch('https://liga.99damage.de/ajax/leagues_match', {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: `id=${matchID}&action=init&devmode=1&language=de`
  })
    .then(response => response.json())
    .then(data => {
      if (data['status'] !== 'finished') return;
      const _getMapName = (id) => getMapName(data['draft_maps'], id);
      if (data['draft_opp1'] === teamName) {
        bans.push(_getMapName(data['draft_mapvoting_bans'][0]));
        bans.push(_getMapName(data['draft_mapvoting_bans'][3]));
      } else if (data['draft_opp2'] === teamName) {
        bans.push(_getMapName(data['draft_mapvoting_bans'][1]));
        bans.push(_getMapName(data['draft_mapvoting_bans'][2]));
      }
    })
    .catch(error => console.log(error));

  return bans;
}

function getMaps() {
  return ['de_dust2', 'de_inferno', 'de_mirage', 'de_nuke', 'de_overpass', 'de_train', 'de_vertigo'];
}

function displayInfo(data) {
  let div = document.createElement('div');
  let table = document.createElement('table');
  let tableHeader = document.createElement('tr');

  let th = document.createElement('th');
  th.textContent = 'Maps';
  tableHeader.appendChild(th);
  for (const map in data['map']) {
    let th = document.createElement('th');
    th.textContent = map['name'];
    tableHeader.appendChild(th);
  }
  table.appendChild(tableHeader);

  let tr = document.createElement('tr');
  th = document.createElement('th');
  th.textContent = '1st ban';
  tr.appendChild(th);
  for (const map in data['map']) {
    let td = document.createElement('th');
    td.textContent = map['ban_1'];
    tr.appendChild(td);
  }
  table.appendChild(tr);

  tr = document.createElement('tr');
  th = document.createElement('th');
  th.textContent = '2nd ban';
  tr.appendChild(th);
  for (const map in data['map']) {
    let td = document.createElement('th');
    td.textContent = map['ban_2'];
    tr.appendChild(td);
  }
  table.appendChild(tr);

  tr = document.createElement('tr');
  th = document.createElement('th');
  th.textContent = 'pick';
  tr.appendChild(th);
  for (const map in data['map']) {
    let td = document.createElement('th');
    td.textContent = map['pick'];
    tr.appendChild(td);
  }
  table.appendChild(tr);

  div.appendChild(table);

  document.querySelector('.league-team-stage').appendChild(div);
}

function getTeamInfo() {
  const teamName = getTeamName();
  const matches = getMatches();
  const maps = getMaps();
  let data = {};

  let bans = [];

  for (const i in matches) {
    bans.push(getMatchInfo(matches[i], teamName));
  }

  // bans = bans.filter(ban => ban.length !== 0);

  console.log(bans);

  for (let i = 0; i < maps.length; i++) {
    data[maps[i]] = {
      'ban_1': bans.map(ban => ban[0]).filter(ban => ban === maps[i]).length,
      'ban_2': bans.map(ban => ban[1]).filter(ban => ban === maps[i]).length,
    };

    // data[maps[i]]['ban_1'] = bans.map(ban => ban[0]).filter(ban => ban === maps[i]).length;
    // data[maps[i]]['ban_2'] = bans.map(ban => ban[1]).filter(ban => ban === maps[i]).length;
  }
  console.log(data);
  console.log(bans);
}

getTeamInfo();