
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
  return fetch('https://liga.99damage.de/ajax/leagues_match', {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: `id=${matchID}&action=init&devmode=1&language=de`
  })
    .then(response => response.json())
    .then(json => {
      let info = [];
      if (json['status'] !== 'finished') return;
      const _getMapName = (id) => getMapName(json['draft_maps'], id);
      if (json['draft_opp1'] === teamName) {
        info.push(_getMapName(json['draft_mapvoting_bans'][0]));
        info.push(_getMapName(json['draft_mapvoting_bans'][3]));
        info.push(_getMapName(json['draft_mapvoting_picks'][1]));
      } else if (json['draft_opp2'] === teamName) {
        info.push(_getMapName(json['draft_mapvoting_bans'][1]));
        info.push(_getMapName(json['draft_mapvoting_bans'][2]));
        info.push(_getMapName(json['draft_mapvoting_picks'][0]));
      }
      return info;
    })
    .catch(error => console.log(error));
}

function getMaps() {
  return ['de_dust2', 'de_inferno', 'de_mirage', 'de_nuke', 'de_overpass', 'de_train', 'de_vertigo'];
}

function displayInfo(data, labels=['Maps', '1st ban', '2nd ban', 'Pick']) {
  let div = document.createElement('div');
  div.classList.add('l99l-container');
  let table = document.createElement('table');
  div.classList.add('l99l-table');


  let tr = document.createElement('tr');
  let th = document.createElement('th');
  th.textContent = labels[0];
  tr.appendChild(th);
  for (const map in data) {
    let th = document.createElement('th');
    th.textContent = map;
    tr.appendChild(th);
  }
  table.appendChild(tr);

  let i = 1;
  for (const attr in data[Object.keys(data)[0]]) {
    let tr = document.createElement('tr');
    let th = document.createElement('th');
    th.textContent = labels[i];
    tr.appendChild(th);

    for (const map in data) {
      let td = document.createElement('td');
      let h = 120 - data[map][attr] * 120;
      let l = data[map][attr] !== 0 ? 80 : 95 ;
      td.style.setProperty('background', 'hsl(' + h + ', 100%, ' + l + '%)');
      td.textContent = (data[map][attr] * 100).toFixed() + '%';
      tr.appendChild(td);
    }
    table.appendChild(tr);
    i++;
  }

  div.appendChild(table);
  document.querySelector('.league-team-stage').appendChild(div);
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function getTeamInfo() {
  const teamName = getTeamName();
  const matches = getMatches();
  const maps = getMaps();

  Promise.all(matches.map(match => getMatchInfo(match, teamName)))
    .then(matches => {
      let data = {};
      matches = matches.filter(match => match !== undefined);
      let count = matches.length;
      for (let i = 0; i < maps.length; i++) {
        data[maps[i]] = {
          'ban_1': round(matches.map(match => match[0]).filter(match => match === maps[i]).length / count),
          'ban_2': round(matches.map(match => match[1]).filter(match => match === maps[i]).length / count),
          'pick': round(matches.map(match => match[2]).filter(match => match === maps[i]).length / count),
        };
      }
      console.log(data);
      return data;
    })
    .then(data => displayInfo(data));
}

getTeamInfo();