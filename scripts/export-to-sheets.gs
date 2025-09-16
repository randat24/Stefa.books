/**
 * Stefa.Books → Google Sheets Export (Apps Script)
 *
 * Как использовать:
 * 1) В Google Sheets: Расширения → Apps Script → вставьте этот файл.
 * 2) В App Script: Проект → Project Settings → Script properties:
 *    - SUPABASE_URL = https://<project>.supabase.co
 *    - SUPABASE_ANON_KEY = <anon_key>   // только anon! (read-only); не используйте service role
 * 3) В таблице запустите функцию exportAll() (через ▶), выдайте разрешения.
 * 4) Данные перезапишут листы с теми же именами.
 */

const CONFIG = {
	pageSize: 1000,
	defaultHeaders: {
		Prefer: 'count=exact',
		'Range-Unit': 'items',
	},
};

function getProps_() {
	const p = PropertiesService.getScriptProperties();
	const url = p.getProperty('SUPABASE_URL');
	const key = p.getProperty('SUPABASE_ANON_KEY');
	if (!url || !key) {
		throw new Error('Set Script Properties: SUPABASE_URL and SUPABASE_ANON_KEY');
	}
	return { url, key };
}

function fetchRange_(path, from, to, select) {
	const { url, key } = getProps_();
	const endpoint = `${url}/rest/v1/${path}${select ? `?select=${encodeURIComponent(select)}` : ''}`;
	const headers = {
		...CONFIG.defaultHeaders,
		Range: `${from}-${to}`,
		apikey: key,
		Authorization: `Bearer ${key}`,
	};
	const resp = UrlFetchApp.fetch(endpoint, { headers, muteHttpExceptions: true });
	const code = resp.getResponseCode();
	if (code !== 200 && code !== 206) {
		throw new Error(`Fetch failed ${code}: ${resp.getContentText()}`);
	}
	return JSON.parse(resp.getContentText() || '[]');
}

function fetchAll_(table, select) {
	const rows = [];
	let from = 0;
	const size = CONFIG.pageSize;
	while (true) {
		const batch = fetchRange_(table, from, from + size - 1, select);
		if (!batch.length) break;
		rows.push(...batch);
		if (batch.length < size) break;
		from += size;
	}
	return rows;
}

function writeSheet_(sheetName, rows) {
	const ss = SpreadsheetApp.getActive();
	const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
	sheet.clearContents();
	if (!rows.length) {
		sheet.getRange(1, 1).setValue('No data');
		return;
	}
	const headers = Array.from(
		rows.reduce((set, r) => {
			Object.keys(r).forEach((k) => set.add(k));
			return set;
		}, new Set())
	);
	const data = rows.map((r) => headers.map((h) => serializeCell_(r[h])));
	sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
	sheet.getRange(2, 1, data.length, headers.length).setValues(data);
	sheet.autoResizeColumns(1, headers.length);
}

function serializeCell_(v) {
	if (v === null || v === undefined) return '';
	if (Array.isArray(v) || typeof v === 'object') return JSON.stringify(v);
	return v;
}

// ---- Public export tasks ----

function exportBooksWithAuthors() {
	const rows = fetchAll_(
		'books_with_authors',
		'id,title,author,author_name,category_name,age_category_name,status,is_active,created_at,updated_at,cover_url,short_description'
	);
	writeSheet_('books_with_authors', rows);
}

function exportBooks() {
	const rows = fetchAll_(
		'books',
		'id,title,author,author_id,category_id,age_category_id,status,is_active,created_at,updated_at,code,rating,rating_count,cover_url,short_description'
	);
	writeSheet_('books', rows);
}

function exportAuthors() {
	const rows = fetchAll_('authors', 'id,name,bio,biography,nationality,created_at,updated_at');
	writeSheet_('authors', rows);
}

function exportCategories() {
	const rows = fetchAll_('categories', 'id,name,slug,parent_id,is_active,created_at,updated_at');
	writeSheet_('categories', rows);
}

function exportAgeCategories() {
	const rows = fetchAll_('age_categories', 'id,name,slug,min_age,max_age,is_active,created_at,updated_at');
	writeSheet_('age_categories', rows);
}

function exportRentals() {
	const rows = fetchAll_('rentals', 'id,user_id,book_id,status,created_at,return_date,updated_at');
	writeSheet_('rentals', rows);
}

function exportSubscriptions() {
	const rows = fetchAll_('subscriptions', 'id,user_id,plan_id,status,expires_at,created_at');
	writeSheet_('subscriptions', rows);
}

function exportSubscriptionRequests() {
	const rows = fetchAll_('subscription_requests', 'id,user_id,phone,status,created_at');
	writeSheet_('subscription_requests', rows);
}

function exportAll() {
	exportBooksWithAuthors();
	exportBooks();
	exportAuthors();
	exportCategories();
	exportAgeCategories();
	exportRentals();
	exportSubscriptions();
	exportSubscriptionRequests();
}
