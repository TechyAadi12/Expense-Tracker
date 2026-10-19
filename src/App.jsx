import React, { useEffect, useMemo, useState } from 'react';

const categoryPalette = ['#8b7cf6', '#5dcb9a', '#ffad78', '#f27d9b', '#70b9ed'];
const metricDetails = {
  balance: { label: 'Balance', tone: 'violet', icon: 'wallet' },
  income: { label: 'Income', tone: 'green', icon: '↓' },
  expenses: { label: 'Expenses', tone: 'orange', icon: '↗' },
  savings: { label: 'Net savings', tone: 'pink', icon: '♡' },
};
const emptyArray = [];

function loadSaved(key) {
  try {
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : emptyArray;
    if (Array.isArray(parsed)) return parsed;
    console.error(`Saved ${key} data was not an array; starting with an empty list.`);
    return emptyArray;
  } catch (error) {
    console.error(`Unable to load ${key} from local storage.`, error);
    return emptyArray;
  }
}

function Icon({ name, size = 19 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="3" /><path d="M3 9h18M16 14h2" /><path d="M6 5V4a2 2 0 0 1 2-2h10" /></>,
    chart: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 6-7" /></>,
    receipt: <><path d="M5 3.5h14v17l-3-2-4 2-4-2-3 2z" /><path d="M8 8h8M8 12h8M8 16h3" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.1.9-1.1 1.9-1.3-.5a7 7 0 0 1-1.5.9l-.2 1.4h-2.2l-.3-1.4a7 7 0 0 1-1.5-.9l-1.3.5-1.1-1.9 1.1-.9a7 7 0 0 1 0-1.8l-1.1-.9 1.1-1.9 1.3.5a7 7 0 0 1 1.5-.9l.3-1.4h2.2l.2 1.4a7 7 0 0 1 1.5.9l1.3-.5 1.1 1.9-1.1.9a7 7 0 0 1-.1 1.8Z" transform="translate(-1 -1) scale(1.08)" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    down: <><path d="m7 10 5 5 5-5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5" /><path d="M5 18v3h14v-3" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
    moon: <><path d="M20.2 15.2A8.5 8.5 0 0 1 8.8 3.8 8.5 8.5 0 1 0 20.2 15.2Z" /></>,
  };
  return <svg {...common}>{paths[name] || paths.grid}</svg>;
}

function formatMoney(value, decimals = 2) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}

function Chart({ data, monthLabel }) {
  const maxValue = Math.max(...data, 1);
  const points = data.map((value, index) => `${35 + index * (696 / Math.max(data.length - 1, 1))},${186 - value / maxValue * 150}`).join(' ');
  return (
    <div className="chart-wrap">
      <div className="chart-y-labels">{[1, 0.75, 0.5, 0.25, 0].map((fraction) => <span key={fraction}>{formatMoney(maxValue * fraction, 0)}</span>)}</div>
      <svg className="chart" viewBox="0 0 740 210" preserveAspectRatio="none" role="img" aria-label={`Daily expenses trend for ${monthLabel}`}>
        <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#7665ec" stopOpacity=".18" /><stop offset="100%" stopColor="#7665ec" stopOpacity="0" /></linearGradient></defs>
        {[28, 67, 106, 145, 184].map((y) => <line key={y} x1="28" y1={y} x2="730" y2={y} className="grid-line" />)}
        <polygon points={`35,186 ${points} 731,186`} fill="url(#chartFill)" />
        <polyline points={points} className="chart-line" />
        {data.length > 0 && <circle cx={35 + (data.length - 1) * (696 / Math.max(data.length - 1, 1))} cy={186 - data[data.length - 1] / maxValue * 150} r="5" className="chart-point" />}
      </svg>
      <div className="chart-x-labels"><span>1</span><span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>{data.length}</span></div>
    </div>
  );
}

function App() {
  const [expenses, setExpenses] = useState(() => loadSaved('moneta-transactions'));
  const [categoryItems, setCategoryItems] = useState(() => loadSaved('moneta-categories'));
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [budgetFormOpen, setBudgetFormOpen] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [reportPeriod, setReportPeriod] = useState('month');
  const [reportCategory, setReportCategory] = useState('All categories');
  const [profileName, setProfileName] = useState(() => {
    try {
      return localStorage.getItem('moneta-profile-name') || '';
    } catch (error) {
      console.error('Unable to load the saved profile name.', error);
      return '';
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('moneta-transactions', JSON.stringify(expenses));
    } catch (error) {
      console.error('Unable to save transactions to local storage.', error);
      setNotice('Unable to save transactions in this browser');
    }
  }, [expenses]);
  useEffect(() => {
    try {
      localStorage.setItem('moneta-categories', JSON.stringify(categoryItems));
    } catch (error) {
      console.error('Unable to save budgets to local storage.', error);
      setNotice('Unable to save budgets in this browser');
    }
  }, [categoryItems]);
  useEffect(() => {
    try {
      localStorage.setItem('moneta-profile-name', profileName);
    } catch (error) {
      console.error('Unable to save the profile name.', error);
      setNotice('Unable to save your name in this browser');
    }
  }, [profileName]);
  const filteredExpenses = useMemo(() => expenses.filter((expense) => {
    const matchesSearch = `${expense.name} ${expense.category}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (categoryFilter === 'All categories' || expense.category === categoryFilter);
  }), [expenses, search, categoryFilter]);
  const currentMonthExpenses = expenses.filter((expense) => expense.type === 'expense' && expense.date.startsWith(month));
  const monthDays = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate();
  const chartData = Array.from({ length: monthDays }, (_, day) => currentMonthExpenses
    .filter((expense) => Number(expense.date.slice(8, 10)) === day + 1)
    .reduce((total, expense) => total + expense.amount, 0));
  const monthlySpent = currentMonthExpenses.reduce((total, expense) => total + expense.amount, 0);
  const totalIncome = expenses.filter((entry) => entry.type === 'income').reduce((total, entry) => total + entry.amount, 0);
  const totalExpenses = expenses.filter((entry) => entry.type === 'expense').reduce((total, entry) => total + entry.amount, 0);
  const categorySpent = (name) => currentMonthExpenses.filter((expense) => expense.category === name).reduce((total, expense) => total + expense.amount, 0);
  const categoryTotal = categoryItems.reduce((total, category) => total + categorySpent(category.name), 0);
  const categoryGradient = categoryTotal > 0
    ? `conic-gradient(${categoryItems.reduce((segments, category) => {
      const start = segments.position;
      const amount = categorySpent(category.name);
      const end = start + (amount / categoryTotal) * 100;
      if (amount > 0) segments.colors.push(`${category.color} ${start}% ${end}%`);
      segments.position = end;
      return segments;
    }, { position: 0, colors: [] }).colors.join(', ')})`
    : 'conic-gradient(#373842 0 100%)';
  const expenseCategoryOptions = [...new Set([...expenses.map((expense) => expense.category), ...categoryItems.map((category) => category.name)])];
  const reportEntries = expenses.filter((entry) => {
    const date = new Date(`${entry.date}T12:00:00`);
    const now = new Date();
    const inPeriod = reportPeriod === 'all'
      || (reportPeriod === 'month' && entry.date.startsWith(month))
      || (reportPeriod === 'year' && date.getFullYear() === now.getFullYear())
      || (reportPeriod === '30days' && date >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29));
    return inPeriod && (reportCategory === 'All categories' || entry.category === reportCategory);
  });
  const reportIncome = reportEntries.filter((entry) => entry.type === 'income').reduce((total, entry) => total + entry.amount, 0);
  const reportExpenses = reportEntries.filter((entry) => entry.type === 'expense').reduce((total, entry) => total + entry.amount, 0);

  function addCategory(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = form.get('name').trim();
    if (categoryItems.some((category) => category.name.toLowerCase() === name.toLowerCase())) {
      setCategoryError('That category already exists.');
      return;
    }
    setCategoryItems((current) => [...current, {
      name,
      budget: Number(form.get('budget')) || 0,
      color: categoryPalette[current.length % categoryPalette.length],
      icon: '◇',
    }]);
    setCategoryFormOpen(false);
    setBudgetFormOpen(false);
    setCategoryError('');
    event.currentTarget.reset();
  }

  function removeExpense(id) {
    setExpenses((current) => current.filter((expense) => expense.id !== id));
  }

  function addExpense(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const category = form.get('category');
    const type = form.get('type');
    setExpenses((current) => [{
      id: Date.now(),
      name: form.get('name').trim(),
      category: category || 'Uncategorized',
      date: form.get('date'),
      amount: Number(form.get('amount')),
      type,
      payment: form.get('payment').trim() || 'Not specified',
    }, ...current]);
    setModalOpen(false);
    event.currentTarget.reset();
    setNotice(`${type === 'income' ? 'Income' : 'Expense'} added successfully`);
    window.setTimeout(() => setNotice(''), 3000);
  }

  function exportCSV(rows, fileName) {
    const safeCell = (value) => {
      const text = String(value ?? '');
      const protectedText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${protectedText.replaceAll('"', '""')}"`;
    };
    const csv = [
      ['Date', 'Type', 'Description', 'Category', 'Payment method', 'Amount'],
      ...rows.map((entry) => [entry.date, entry.type, entry.name, entry.category, entry.payment, entry.type === 'expense' ? -entry.amount : entry.amount]),
    ].map((row) => row.map((value, index) => index === 5 && typeof value === 'number' ? String(value) : safeCell(value)).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`${rows.length} transaction${rows.length === 1 ? '' : 's'} exported`);
  }

  function clearAllData() {
    setExpenses([]);
    setCategoryItems([]);
    setSearch('');
    setCategoryFilter('All categories');
    setNotice('All transactions and budgets have been cleared');
  }

  return (
    <div className="app-shell" data-theme={darkMode ? 'dark' : 'light'}>
      <aside className="sidebar">
        <a href="#dashboard" className="brand"><span className="brand-mark"><span /></span><span>moneta</span></a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list" aria-label="Main navigation">
          <a className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`} href="#dashboard" onClick={() => setActiveSection('dashboard')}><Icon name="grid" /> <span>Overview</span></a>
          <a className={`nav-item ${activeSection === 'transactions' ? 'active' : ''}`} href="#transactions" onClick={() => setActiveSection('transactions')}><Icon name="receipt" /> <span>Transactions</span><span className="nav-count">{expenses.length}</span></a>
          <a className={`nav-item ${activeSection === 'budgets' ? 'active' : ''}`} href="#budgets" onClick={() => setActiveSection('budgets')}><Icon name="wallet" /> <span>Budgets</span></a>
          <a className={`nav-item ${activeSection === 'reports' ? 'active' : ''}`} href="#reports" onClick={() => setActiveSection('reports')}><Icon name="chart" /> <span>Reports</span></a>
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <span className="upgrade-spark">✦</span>
            <strong>Make your money<br />work smarter.</strong>
            <p>Get a clearer picture with Moneta Plus.</p>
            <button type="button" onClick={() => setNotice('You’re already on the list for Moneta Plus!')}>Explore Plus <Icon name="arrow" size={15} /></button>
          </div>
          <a className={`nav-item settings-link ${activeSection === 'settings' ? 'active' : ''}`} href="#settings" onClick={() => setActiveSection('settings')}><Icon name="settings" /> <span>Settings</span></a>
          <div className="profile">
            <div className="avatar">{profileName.trim().slice(0, 2).toUpperCase() || 'ME'}</div><div className="profile-info"><strong>{profileName.trim() || 'Your account'}</strong><span>Personal account</span></div>
          </div>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div className="breadcrumb">Pages <span>/</span> <strong>Overview</strong></div>
          <div className="topbar-actions">
            <div className="search-box"><Icon name="search" size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search anything..." aria-label="Search expenses" /><kbd>⌘ K</kbd></div>
            <button type="button" className="theme-toggle" aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`} aria-pressed={darkMode} onClick={() => setDarkMode((current) => !current)}><Icon name={darkMode ? 'sun' : 'moon'} size={17} /><span>{darkMode ? 'Light mode' : 'Dark mode'}</span></button>
            <button type="button" className="icon-button notification-button" aria-label="Notifications" onClick={() => setNotice('You’re all caught up!')}><Icon name="bell" /><i /></button>
            <div className="top-avatar">{profileName.trim().slice(0, 2).toUpperCase() || 'ME'}</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div><div className="eyebrow"><span className="live-dot" /> YOUR FINANCIAL SNAPSHOT</div><h1>{profileName.trim() ? `Welcome, ${profileName.trim()}` : 'Your financial snapshot'} <span>✦</span></h1><p>Add your first transaction to see your finances here.</p></div>
            <div className="welcome-actions"><button type="button" className="button button-secondary" onClick={() => exportCSV(expenses, 'moneta-transactions.csv')}><Icon name="download" size={17} /> Export</button><button type="button" className="button button-primary" onClick={() => setModalOpen(true)}><Icon name="plus" size={18} /> Add transaction</button></div>
          </section>

          <section className="stats-grid" aria-label="Financial summary">
            {Object.keys(metricDetails).map((key) => {
              const metric = metricDetails[key];
              const value = key === 'balance' || key === 'savings' ? totalIncome - totalExpenses : key === 'income' ? totalIncome : totalExpenses;
              return <article className="stat-card" key={key}>
                <div className="stat-top"><span>{metric.label}</span><span className={`stat-icon ${metric.tone}`}>{metric.icon === 'wallet' ? <Icon name="wallet" size={18} /> : <span>{metric.icon}</span>}</span></div><div className="stat-value">{formatMoney(value)}</div><div className="stat-foot"><span>From your transactions</span></div>
              </article>;
            })}
          </section>

          <section className="primary-grid">
            <article className="panel spending-panel">
              <div className="panel-heading"><div><h2>Spending overview</h2><p>Daily expenses for the selected month.</p></div><label className="month-picker"><Icon name="calendar" size={16} /><span className="sr-only">Select dashboard month</span><input type="month" value={month} onChange={(event) => { if (event.target.value) setMonth(event.target.value); }} /></label></div>
              <div className="chart-summary"><div><span className="muted-label">Total spent</span><strong>{formatMoney(monthlySpent)}</strong></div><div className="chart-legend"><span><i className="legend-dot actual" /> Expenses</span></div></div>
              {monthlySpent ? <Chart data={chartData} monthLabel={new Date(`${month}-02T12:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} /> : <div className="chart-empty">No expenses for this month yet. Add a transaction to see your spending trend.</div>}
            </article>
            <article className="panel categories-panel">
              <div className="panel-heading"><div><h2>Spending by category</h2><p>Based on expenses this month.</p></div><button type="button" className="manage-action" onClick={() => setCategoryFormOpen((current) => !current)}>{categoryFormOpen ? 'Cancel' : '+ Add category'}</button></div>
              {categoryItems.length ? <><div className="category-chart-area"><div className="donut" style={{ background: categoryGradient }}><div className="donut-center"><span>Total spent</span><strong>{formatMoney(categoryTotal, 0)}</strong><small>this month</small></div></div></div>
              <div className="category-list">{categoryItems.map((category) => <div className="category-row" key={category.name}><span className="category-color" style={{ backgroundColor: category.color }} /><span className="category-name">{category.name}</span><strong>{formatMoney(categorySpent(category.name), 0)}</strong><span className="category-percent">{categoryTotal ? Math.round(categorySpent(category.name) / categoryTotal * 100) : 0}%</span><button type="button" className="remove-control category-remove" aria-label={`Remove ${category.name} category`} onClick={() => setCategoryItems((current) => current.filter((item) => item.name !== category.name))}>×</button></div>)}</div></> : <div className="empty-section">No categories yet. Add one to organize your expenses and create a budget.</div>}
              {categoryFormOpen && <form className="category-form" onSubmit={addCategory}><label><span className="sr-only">Category name</span><input name="name" placeholder="Category name" required maxLength="24" /></label><label><span className="sr-only">Monthly budget</span><input name="budget" type="number" min="0" step="0.01" placeholder="Monthly budget" /></label><button type="submit" className="manage-action">Add</button>{categoryError && <span className="category-error">{categoryError}</span>}</form>}
            </article>
          </section>

          <section className="panel transactions-panel" id="transactions">
            <div className="panel-heading transactions-heading"><div><h2>Transactions</h2><p>Add and manage income and expenses.</p></div><div className="transaction-actions"><label className="filter-select"><span className="sr-only">Filter by category</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option>All categories</option>{expenseCategoryOptions.map((category) => <option key={category}>{category}</option>)}</select><Icon name="down" size={14} /></label><button type="button" className="view-all" onClick={() => { setCategoryFilter('All categories'); setSearch(''); }}>Clear filters <Icon name="arrow" size={15} /></button><button type="button" className="button button-primary" onClick={() => setModalOpen(true)}><Icon name="plus" size={16} /> Add transaction</button></div></div>
            <div className="transaction-table-wrap"><table className="transaction-table"><thead><tr><th>TRANSACTION</th><th>TYPE</th><th>CATEGORY</th><th>DATE</th><th>PAYMENT METHOD</th><th className="amount-column">AMOUNT</th><th className="manage-column">MANAGE</th></tr></thead><tbody>{filteredExpenses.length ? filteredExpenses.map((expense) => <tr key={expense.id}><td><div className="merchant-cell"><span className={`merchant-icon ${expense.type === 'income' ? 'mint' : 'lavender'}`}><Icon name={expense.type === 'income' ? 'wallet' : 'receipt'} size={16} /></span><strong>{expense.name}</strong></div></td><td><span className={`category-pill ${expense.type === 'income' ? 'income-pill' : ''}`}>{expense.type === 'income' ? 'Income' : 'Expense'}</span></td><td><span className="category-pill">{expense.category}</span></td><td>{new Date(`${expense.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td><td><span className="payment-dot" />{expense.payment}</td><td className={`amount-column ${expense.type === 'income' ? 'income-amount' : ''}`}><strong>{expense.type === 'income' ? '+' : '−'}{formatMoney(expense.amount)}</strong></td><td className="manage-column"><button type="button" className="remove-control transaction-remove" aria-label={`Remove ${expense.name}`} onClick={() => removeExpense(expense.id)}>×</button></td></tr>) : <tr><td colSpan="7" className="empty-state">{search || categoryFilter !== 'All categories' ? 'No transactions match your filters.' : 'No transactions yet. Add your income or first expense to get started.'}</td></tr>}</tbody></table></div>
            <div className="table-footer"><span>Showing <strong>{filteredExpenses.length}</strong> of <strong>{expenses.length}</strong> transactions</span><button type="button" onClick={() => setModalOpen(true)}>+ Add transaction</button></div>
          </section>

          <section className="panel budgets-panel" id="budgets">
            <div className="panel-heading"><div><h2>Monthly budgets</h2><p>Set a spending limit and track expenses against each category.</p></div><button type="button" className="manage-action" onClick={() => setBudgetFormOpen((current) => !current)}>{budgetFormOpen ? 'Cancel' : '+ Add budget'}</button></div>
            {categoryItems.length ? <div className="budget-list">{categoryItems.map((category) => {
              const spent = categorySpent(category.name);
              const budget = Number(category.budget) || 0;
              const progress = budget ? Math.min(100, spent / budget * 100) : 0;
              return <div className="budget-row" key={category.name}>
                <span className="category-color" style={{ backgroundColor: category.color }} />
                <div className="budget-category"><strong>{category.name}</strong><span>{formatMoney(spent)} spent{budget ? ` of ${formatMoney(budget)}` : ' · set a budget to track progress'}</span><div className="budget-track"><span style={{ width: `${progress}%`, backgroundColor: category.color }} /></div></div>
                <label className="budget-input"><span className="sr-only">{category.name} monthly budget</span><span>$</span><input type="number" min="0" step="0.01" value={category.budget || ''} placeholder="Set limit" onChange={(event) => setCategoryItems((current) => current.map((item) => item.name === category.name ? { ...item, budget: Number(event.target.value) || 0 } : item))} /></label>
                <button type="button" className="remove-control category-remove" aria-label={`Remove ${category.name} budget`} onClick={() => setCategoryItems((current) => current.filter((item) => item.name !== category.name))}>×</button>
              </div>;
            })}</div> : <div className="empty-section">No budgets yet. Add a category and monthly limit to start tracking your spending.</div>}
            {budgetFormOpen && <form className="category-form" onSubmit={addCategory}><label><span className="sr-only">Category name</span><input name="name" placeholder="Category name" required maxLength="24" /></label><label><span className="sr-only">Monthly budget</span><input name="budget" type="number" min="0" step="0.01" placeholder="Monthly budget" /></label><button type="submit" className="manage-action">Add budget</button>{categoryError && <span className="category-error">{categoryError}</span>}</form>}
          </section>

          <section className="panel reports-panel" id="reports">
            <div className="panel-heading"><div><h2>Reports</h2><p>Explore your income and spending for a period or category.</p></div><div className="report-filters"><label className="filter-select"><span className="sr-only">Report period</span><select value={reportPeriod} onChange={(event) => setReportPeriod(event.target.value)}><option value="month">Selected month</option><option value="30days">Last 30 days</option><option value="year">This year</option><option value="all">All time</option></select><Icon name="down" size={14} /></label>{reportPeriod === 'month' && <label className="month-picker"><span className="sr-only">Report month</span><input type="month" value={month} onChange={(event) => { if (event.target.value) setMonth(event.target.value); }} /></label>}<label className="filter-select"><span className="sr-only">Report category</span><select value={reportCategory} onChange={(event) => setReportCategory(event.target.value)}><option>All categories</option>{expenseCategoryOptions.map((category) => <option key={category}>{category}</option>)}</select><Icon name="down" size={14} /></label><button type="button" className="button button-secondary" onClick={() => exportCSV(reportEntries, 'moneta-report.csv')}><Icon name="download" size={15} /> Export CSV</button></div></div>
            <div className="report-summary"><article><span>Income</span><strong>{formatMoney(reportIncome)}</strong></article><article><span>Expenses</span><strong>{formatMoney(reportExpenses)}</strong></article><article><span>Net</span><strong>{formatMoney(reportIncome - reportExpenses)}</strong></article></div>
            <div className="report-results"><h3>Transactions in this report <span>{reportEntries.length}</span></h3>{reportEntries.length ? <div className="report-category-list">{[...new Set(reportEntries.map((entry) => entry.category))].map((category) => {
              const spent = reportEntries.filter((entry) => entry.type === 'expense' && entry.category === category).reduce((total, entry) => total + entry.amount, 0);
              const earned = reportEntries.filter((entry) => entry.type === 'income' && entry.category === category).reduce((total, entry) => total + entry.amount, 0);
              return <div className="report-category-row" key={category}><span>{category}</span><span>{spent ? `Spent ${formatMoney(spent)}` : ''}{spent && earned ? ' · ' : ''}{earned ? `Earned ${formatMoney(earned)}` : ''}</span></div>;
            })}</div> : <div className="empty-section">No transactions for this report yet. Add entries to see your report.</div>}</div>
          </section>

          <section className="panel settings-panel" id="settings">
            <div className="panel-heading"><div><h2>Settings</h2><p>Personalize your account and manage your saved data.</p></div></div>
            <label className="profile-setting">Name<input value={profileName} maxLength="50" placeholder="Enter your name" onChange={(event) => setProfileName(event.target.value)} /></label>
            <div className="settings-data"><div><strong>Start over</strong><p>Delete all saved transactions and budgets from this browser. This cannot be undone.</p></div><button type="button" className="button button-danger" onClick={() => { if (window.confirm('Delete all transactions and budgets? This cannot be undone.')) clearAllData(); }}>Clear all data</button></div>
          </section>
          <footer className="page-footer"><span>© 2025 Moneta. A little more clarity, every day.</span><span>Made for your peace of mind <span className="footer-heart">♥</span></span></footer>
        </div>
      </main>

      {notice && <div className="toast" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Dismiss notification">×</button></div>}
      {modalOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}><section className="expense-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><span className="eyebrow">YOUR MONEY, YOUR WAY</span><h2 id="modal-title">Add a transaction</h2></div><button type="button" className="modal-close" aria-label="Close" onClick={() => setModalOpen(false)}>×</button></div><p className="modal-copy">Enter income or an expense. Your dashboards and reports update automatically.</p><form onSubmit={addExpense}><div className="form-row"><label>Type<select name="type" defaultValue="expense"><option value="expense">Expense</option><option value="income">Income</option></select></label><label>Amount<input name="amount" type="number" placeholder="0.00" min="0.01" step="0.01" required /></label></div><label>Description<input name="name" type="text" placeholder="e.g. Groceries or monthly salary" required maxLength="60" autoFocus /></label><div className="form-row"><label>Category<select name="category" defaultValue=""><option value="">Uncategorized</option>{expenseCategoryOptions.map((category) => <option key={category}>{category}</option>)}</select></label><label>Date<input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label></div><label>Payment method<input name="payment" type="text" placeholder="e.g. Cash, debit card, direct deposit" maxLength="40" /></label><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="button button-primary"><Icon name="plus" size={17} /> Add transaction</button></div></form></section></div>}
    </div>
  );
}

export default App;
