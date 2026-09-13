"""UI regression checks using an installed agent-browser CLI; no Python dependencies.
Run with dev server active:
  python tests/browser_checks.py --browser-cli /path/to/agent-browser
Comments are intercepted in the isolated test browser and never reach the restaurant.
"""
import argparse
import sys
sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")
import json
import subprocess
import tempfile
import time
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--browser-cli', default='agent-browser')
parser.add_argument('--url', default='http://127.0.0.1:5173')
args = parser.parse_args()
shots = Path(tempfile.mkdtemp(prefix='bahandi-check-'))
passed = []

def call(*parts):
    # File-backed output avoids inherited Windows daemon pipes keeping communicate() open.
    with tempfile.TemporaryFile() as output:
        result = subprocess.run([args.browser_cli, '--session', 'bahandi-logic', *parts], stdout=output, stderr=output, timeout=45)
        output.seek(0)
        text = output.read().decode('utf-8').strip()
    if result.returncode:
        raise AssertionError(f'{parts[0]} failed: {text}')
    return text


def evaluate(expression):
    output = call('eval', '(async () => JSON.stringify(await (' + expression + ')))()')
    value = json.loads(output)
    return json.loads(value) if isinstance(value, str) else value

def check(name, expression):
    for _ in range(20):
        if evaluate(expression):
            passed.append(name)
            print('PASS:', name, flush=True)
            return
        time.sleep(.15)
    print("FAIL STATE:", call("eval", "document.body.innerText"), flush=True)
    print("BROWSER ERRORS:", call("errors"), flush=True)
    print("REQUESTS:", call("network", "requests", "--filter", "comments"), flush=True)
    raise AssertionError(name)

def open_page(path):
    call('open', args.url + path)

def stored():
    return evaluate('JSON.parse(localStorage.getItem("bahandi_cart_v1"))')

try:
    call('--executable-path', 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'open', args.url)
    evaluate('localStorage.removeItem("bahandi_cart_v1")')
    open_page('/foods')
    call('wait', '.drink-card')
    check('empty cart has no checkout and clear is disabled', 'document.querySelector(".clear-cart").disabled && !document.querySelector(".checkout-trigger") && !document.querySelector(".cart-badge")')
    call('click', '.drink-card .buy-btn')
    check('short added feedback', 'document.querySelector(".drink-card .buy-btn").textContent.includes("Добавлено")')
    call('click', '.drink-card .buy-btn')
    check('same item increments and Navbar count updates', 'JSON.parse(localStorage.getItem("bahandi_cart_v1"))[0]?.quantity === 2 && document.querySelector(".cart-badge").textContent === "2"')
    first = stored()[0]
    call('reload')
    check('cart restored after reload', 'document.querySelector(".cart-badge")?.textContent === "2" && document.querySelectorAll(".cart-item").length === 1')
    call('click', '.quantity-controls button')
    check('decrement updates quantity', 'JSON.parse(localStorage.getItem("bahandi_cart_v1"))[0]?.quantity === 1')
    call('click', '.quantity-controls button')
    check('decrement from one removes item', 'JSON.parse(localStorage.getItem("bahandi_cart_v1")).length === 0 && !document.querySelector(".cart-badge")')
    call('click', '.drink-card .buy-btn')
    call('click', '.remove-item')
    check('explicit remove works', 'document.querySelectorAll(".cart-item").length === 0')
    call('click', '.drink-card .buy-btn')
    call('click', '.clear-cart')
    call('dialog', 'dismiss')
    check('cancel clear retains item', 'document.querySelectorAll(".cart-item").length === 1')
    call('click', '.clear-cart')
    call('dialog', 'accept')
    check('confirm clear empties cart', 'document.querySelectorAll(".cart-item").length === 0')
    open_page('/foods/' + str(first['id']))
    call('wait', '.detail-copy .buy-btn')
    call('click', '.detail-copy .buy-btn')
    check('detail adds to shared cart', 'document.querySelector(".cart-badge")?.textContent === "1"')
    call('click', '.cart-btn')
    check('cart navigation scrolls and focuses panel', 'location.hash === "#cart" && document.activeElement.id === "cart" && Math.abs(document.querySelector("#cart").getBoundingClientRect().top) < 60')
    for raw in ['{broken', '{}', '[null, {"id":1,"quantity":-2}]']:
        evaluate('localStorage.setItem("bahandi_cart_v1", ' + json.dumps(raw) + ')')
        call('reload')
        check('invalid storage recovers: ' + raw, 'Array.isArray(JSON.parse(localStorage.getItem("bahandi_cart_v1"))) && JSON.parse(localStorage.getItem("bahandi_cart_v1")).length === 0')
    call('fill', '#menu-search', '  BonAqua  ')
    call('click', '.navbar-search button')
    check('trimmed search', 'new URLSearchParams(location.search).get("search") === "BonAqua" && document.querySelectorAll(".drink-card").length === 1')
    call('fill', '#menu-search', 'Sprite')
    call('click', '.navbar-search button')
    check('second query', 'document.querySelector("#menu-search").value === "Sprite"')
    call('back')
    check('browser back synchronizes input and results', 'document.querySelector("#menu-search").value === "BonAqua" && document.querySelector(".drink-name")?.textContent.includes("BonAqua")')
    call('forward')
    check('browser forward synchronizes input', 'document.querySelector("#menu-search").value === "Sprite"')
    # A browser-local axios adapter simulates POSTs; a network abort is a second guard.
    call('network', 'route', '**/comments', '--abort')
    open_page('/foods/' + str(first['id']))
    call('wait', '.comment-btn')
    check('comments loaded', '!document.querySelector(".comment-btn").disabled')
    evaluate("""(async () => {
        const { api } = await import('/src/api/client.js');
        window.commentSends = [];
        api.defaults.adapter = async config => {
            if (config.method !== 'post' || config.url !== '/comments') throw new Error('Unexpected test request');
            window.commentSends.push(config.data);
            await new Promise(resolve => setTimeout(resolve, 800));
            if (window.failComment) throw Object.assign(new Error('Test network failure'), { isAxiosError: true });
            return { data: { id: 'test-comment', text: JSON.parse(config.data).text, createdAt: 'invalid' }, status: 201, statusText: 'Created', headers: {}, config };
        };
    })()""")
    call('fill', '#comment', '   ')
    call('click', '.comment-btn')
    check('empty comment blocked', 'document.querySelector("#comment-feedback").textContent.includes("не может быть пустым")')
    call('fill', '#comment', 'я' * 501)
    check('comment field limits input to 500', 'document.querySelector("#comment").value.length <= 500 && document.querySelector("#comment").maxLength === 500')
    call('fill', '#comment', ' Тестовый комментарий ')
    evaluate('(() => { const f=document.querySelector(".comment-form"); f.requestSubmit(); f.requestSubmit(); })()')
    check('duplicate comment submit blocked', 'window.commentSends.length === 1 && document.querySelector(".comment-btn").disabled')
    check('mock comment success and invalid date fallback', 'document.querySelector("#comment-feedback").textContent.includes("успешно") && [...document.querySelectorAll(".comment-date")].some(x => x.textContent === "Дата не указана")')
    check('comment trimmed before POST', 'JSON.parse(window.commentSends[0]).text === "Тестовый комментарий"')
    evaluate('window.failComment = true')
    call('fill', '#comment', 'Проверка ошибки')
    call('click', '.comment-btn')
    check('comment failure is visible and retry enabled', 'document.querySelector("#comment-feedback").textContent.includes("не отправлен") && !document.querySelector(".comment-btn").disabled')
    open_page('/foods')
    call('wait', '.drink-card')
    call('click', '.drink-card .buy-btn')
    call('click', '.checkout-trigger')
    check('checkout explicitly demo and pickup hides address', 'document.querySelector(".checkout-form").textContent.includes("не отправляется") && !document.querySelector("#order-address")')
    call('click', '.checkout-form button[type="submit"]')
    check('checkout validation catches missing fields', 'document.querySelectorAll(".checkout-form .field-error").length >= 3')
    call('fill', '#order-name', 'Тест')
    call('fill', '#order-phone', '+1 111 111 1111')
    call('click', '.checkout-form button[type="submit"]')
    check('invalid Kazakhstan phone rejected', 'document.querySelector("#order-phone").getAttribute("aria-invalid") === "true"')
    call('fill', '#order-phone', '+7 (701) 123-45-67')
    call('select', '#order-method', 'delivery')
    call('click', '.checkout-form button[type="submit"]')
    check('delivery requires address', 'document.querySelector("#order-address").getAttribute("aria-invalid") === "true"')
    call('fill', '#order-address', 'Тестовый адрес 1')
    call('check', '#order-confirmed')
    call('click', '.quantity-controls button:nth-of-type(2)')
    check('cart changes invalidate checkout confirmation', '!document.querySelector("#order-confirmed").checked')
    call('check', '#order-confirmed')
    evaluate('(() => { window.demoRequests=0; const send=XMLHttpRequest.prototype.send; XMLHttpRequest.prototype.send=function(...a){window.demoRequests++; return send.apply(this,a)}; const f=window.fetch; window.fetch=(...a)=>{window.demoRequests++; return f(...a)}; })()')
    call('click', '.checkout-form button[type="submit"]')
    check('demo success sends nothing and keeps cart', 'document.querySelector(".checkout-form").textContent.includes("Заказ не отправлен") && window.demoRequests === 0 && document.querySelectorAll(".cart-item").length > 0')
    check('personal data not stored', '!JSON.stringify(localStorage).includes("Тестовый адрес") && !JSON.stringify(localStorage).includes("701")')
    open_page('/no-such-page')
    check('unknown route shows 404 links', 'document.querySelector("h1").textContent === "Страница не найдена" && document.querySelector("a[href=\\"/foods\\"]") !== null')
    # GET failures and successful retries on each page.
    for endpoint, path, ready in [('homecards', '/', '.home-card'), ('foods', '/foods', '.drink-card'), ('foods/' + str(first['id']), '/foods/' + str(first['id']), '.detail-title')]:
        pattern = 'https://8793bad894280e6b.mokky.dev/' + endpoint
        call('network', 'route', pattern, '--abort')
        open_page(path)
        call('wait', '.retry-button')
        check('API failure UI: ' + path, 'document.querySelector(".error-sub").textContent.length > 0')
        call('network', 'unroute', pattern)
        call('click', '.retry-button')
        call('wait', ready)
        check('retry recovers: ' + path, '!document.querySelector(".retry-button")')
    call('network', 'unroute')
    for path, name, ready in [('/', 'home', '.home-card'), ('/foods', 'menu', '.drink-card'), ('/foods/' + str(first['id']), 'detail', '.detail-title')]:
        open_page(path)
        call('wait', ready)
        for width in [1440, 1024, 768, 390]:
            call('set', 'viewport', str(width), '900')
            check(f'{name} fits {width}px', 'document.documentElement.scrollWidth <= innerWidth')
            call('screenshot', str(shots / f'{name}-{width}.png'))
    print(f'PASS: {len(passed)} checks. Screenshots: {shots}', flush=True)
finally:
    call('network', 'unroute')
    call('close')
