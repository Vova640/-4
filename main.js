document.addEventListener('DOMContentLoaded', init);

function init() {
  const root = document.getElementById('main');
  const header = document.createElement('header');
  const mainArea = document.createElement('div');
  mainArea.className = 'main-area';
  const footer = document.createElement('footer');

  root.appendChild(header);
  root.appendChild(mainArea);
  root.appendChild(footer);
  const headerButtons = ['User Rating','News','Contacts','About'];
  headerButtons.forEach(name => {
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.addEventListener('click', () => onHeaderButtonClick(name));
    header.appendChild(btn);
  });

  const leftPanel = document.createElement('div');
  leftPanel.className = 'leftPanel';
  leftPanel.id = 'leftPanel';

  const content = document.createElement('div');
  content.className = 'content';
  content.id = 'content';

  const rightPanel = document.createElement('div');
  rightPanel.className = 'rightPanel';
  rightPanel.id = 'rightPanel';

  mainArea.appendChild(leftPanel);
  mainArea.appendChild(content);
  mainArea.appendChild(rightPanel);

  const currentUsersBox = document.createElement('div');
  currentUsersBox.className = 'footer-block';
  currentUsersBox.id = 'currentUsersBox';
  currentUsersBox.innerHTML = `<strong>Current users:</strong> <span id="currentUsersCount">0</span>`;

  const newUsersBox = document.createElement('div');
  newUsersBox.className = 'footer-block';
  newUsersBox.id = 'newUsersBox';
  newUsersBox.innerHTML = `<strong>New users:</strong> <ul id="newUsersList"></ul>`;

  footer.appendChild(currentUsersBox);
  footer.appendChild(newUsersBox);

  [leftPanel, content, rightPanel].forEach(panel => {
    const l = document.createElement('div');
    l.className = 'loader';
    panel.appendChild(l);
  });

  setTimeout(() => {
    const loader = content.querySelector('.loader');
    if (loader) loader.remove();

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = 'No users';
    content.appendChild(title);

    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder';
    placeholder.innerHTML = `<p>Поки що немає даних.</p>`;
    content.appendChild(placeholder);

    const getBtn = document.createElement('button');
    getBtn.textContent = 'Get Users';
    getBtn.style.padding = '8px 12px';
    getBtn.addEventListener('click', onGetUsersClick);
    content.appendChild(getBtn);
  }, 1000);
  setTimeout(() => {
    const loader = leftPanel.querySelector('.loader');
    if (loader) loader.remove();

    const searchRow = document.createElement('div');
    searchRow.className = 'search-row';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Пошук по таблиці (фрагмент)...';
    input.id = 'searchInput';

    const searchBtn = document.createElement('button');
    searchBtn.textContent = 'Search';
    searchBtn.addEventListener('click', () => onSearchClick(input.value));

    searchRow.appendChild(input);
    searchRow.appendChild(searchBtn);
    leftPanel.appendChild(searchRow);
  }, 1000);
  setTimeout(() => {
    const loader = rightPanel.querySelector('.loader');
    if (loader) loader.remove();

    const sumBox = document.createElement('div');
    sumBox.className = 'sum-box';
    sumBox.id = 'sumBox';
    sumBox.textContent = 'Sum of scores: 0';
    rightPanel.appendChild(sumBox);
    const editRow = document.createElement('div');
    editRow.style.marginTop = '12px';
    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.id = 'editTableChk';
    const lbl = document.createElement('label');
    lbl.htmlFor = 'editTableChk';
    lbl.style.marginLeft = '6px';
    lbl.textContent = 'Edit table';
    chk.addEventListener('change', onEditToggle);
    editRow.appendChild(chk);
    editRow.appendChild(lbl);
    rightPanel.appendChild(editRow);
  }, 1000);
  renderNewUsersFooter();

  let lastFetchedUsers = []; 
  let tableElement = null;
  let deleteColumnEnabled = false;
  let sortAsc = true;

  function onHeaderButtonClick(name) {
    let title = content.querySelector('.title');
    if (!title) {
      title = document.createElement('div');
      title.className = 'title';
      content.insertBefore(title, content.firstChild);
    }
    title.textContent = name;
  }

  function renderNewUsersFooter() {
    const list = document.getElementById('newUsersList');
    if (!list) return;
    list.innerHTML = '';
    const newUsers = window.api.getNewUsers(); 
    newUsers.forEach(u => {
      const li = document.createElement('li');
      const nick = `${u.firstname}.${u.lastname}`.replace(/\s+/g,'');
      li.textContent = nick;
      list.appendChild(li);
    });
  }

  function onGetUsersClick() {
    content.innerHTML = '';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = 'Users';
    content.appendChild(title);

    const loader = document.createElement('div');
    loader.className = 'loader';
    content.appendChild(loader);

    // Виклик api.fetchUsers
    window.api.fetchUsers().then(users => {
      lastFetchedUsers = users.slice(); 
      const l = content.querySelector('.loader');
      if (l) l.remove();

      buildUsersTable(users);
      updateSumAndFooter();
    });
  }

  function buildUsersTable(users) {
    if (tableElement && tableElement.parentElement) tableElement.parentElement.removeChild(tableElement);

    const table = document.createElement('table');
    table.className = 'users-table';
    table.id = 'usersTable';

    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    const thLast = document.createElement('th');
    thLast.textContent = 'Lastname';
    thLast.addEventListener('click', () => onSortByLastname(table, 1)); 
    tr.appendChild(thLast);

    const thFirst = document.createElement('th');
    thFirst.textContent = 'Firstname';
    tr.appendChild(thFirst);

    const thScore = document.createElement('th');
    thScore.textContent = 'Score';
    tr.appendChild(thScore);

    if (deleteColumnEnabled) {
      const thDel = document.createElement('th');
      thDel.textContent = 'Actions';
      tr.appendChild(thDel);
    }

    thead.appendChild(tr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    users.forEach((u, idx) => {
      const r = createRowForUser(u, idx);
      tbody.appendChild(r);
    });

    table.appendChild(tbody);
    content.appendChild(table);
    tableElement = table;
  }

  function createRowForUser(user, idx) {
    const tr = document.createElement('tr');
    const tdLast = document.createElement('td');
    tdLast.textContent = user.lastname;
    tr.appendChild(tdLast);

    const tdFirst = document.createElement('td');
    tdFirst.textContent = user.firstname;
    tr.appendChild(tdFirst);

    const tdScore = document.createElement('td');
    tdScore.textContent = user.score;
    tr.appendChild(tdScore);

    if (deleteColumnEnabled) {
      const tdAct = document.createElement('td');
      const delBtn = document.createElement('button');
      delBtn.className = 'btn-delete';
      delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', () => {
        tr.remove();
        const idx = lastFetchedUsers.findIndex(x => x.firstname === user.firstname && x.lastname === user.lastname && x.score === user.score);
        if (idx >= 0) {
          lastFetchedUsers.splice(idx,1);
        }
        updateSumAndFooter();
      });
      tdAct.appendChild(delBtn);
      tr.appendChild(tdAct);
    }

    return tr;
  }

  function onSearchClick(fragment) {
    if (!tableElement) return;
    const text = fragment.trim().toLowerCase();
    const rows = Array.from(tableElement.querySelectorAll('tbody tr'));
    rows.forEach(row => {
      row.classList.remove('highlight');
      if (!text) return;
      // перевіримо всі клітинки у рядку
      const cells = Array.from(row.querySelectorAll('td'));
      const any = cells.some(td => td.textContent.toLowerCase().includes(text));
      if (any) row.classList.add('highlight');
    });
  }

  function onEditToggle(e) {
    deleteColumnEnabled = e.target.checked;
    if (tableElement) {
      buildUsersTable(lastFetchedUsers);
    }
  }

  function updateSumAndFooter() {
    const sum = lastFetchedUsers.reduce((acc, u) => acc + Number(u.score || 0), 0);
    const sumBox = document.getElementById('sumBox');
    if (sumBox) sumBox.textContent = `Sum of scores: ${sum}`;

    const countSpan = document.getElementById('currentUsersCount');
    if (countSpan) countSpan.textContent = lastFetchedUsers.length;

  }

  function onSortByLastname(table, colIndex) {
    if (!lastFetchedUsers || !lastFetchedUsers.length) return;
    // сортуємо за lastname
    lastFetchedUsers.sort((a,b) => {
      const A = a.lastname.toLowerCase();
      const B = b.lastname.toLowerCase();
      if (A < B) return sortAsc ? -1 : 1;
      if (A > B) return sortAsc ? 1 : -1;
      return 0;
    });
    sortAsc = !sortAsc; 
    buildUsersTable(lastFetchedUsers);
    updateSumAndFooter();
  }

  window.lab4 = {
    rebuildTable: () => buildUsersTable(lastFetchedUsers),
    getUsers: () => lastFetchedUsers
  };
}
