# Prueba de humo en navegador (Playwright + Chrome). Uso: python3 tests/smoke.py [url]
import sys, asyncio
from playwright.async_api import async_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8099/index.html'
async def main():
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-background-networking','--disable-sync','--no-first-run'])
        for name, vp in [('mobile', {'width':390,'height':780})]:
            pg = await b.new_page(viewport=vp)
            pg.on('console', lambda m: errs.append(f'[{name}] {m.text}') if m.type == 'error' else None)
            pg.on('pageerror', lambda e: errs.append(f'[{name}] PAGEERROR {e}'))
            await pg.goto(URL); await pg.wait_for_timeout(2500)
            print(name, 'loading gone:', await pg.locator('#loading').count() == 0)
            await pg.screenshot(path=f'/tmp/gpulab_{name}_info.png')
            for t in ['comp','dis','lab','learn','prog']:
                await pg.click(f'[data-tab={t}]'); await pg.wait_for_timeout(200)
            await pg.click('[data-tab=comp]'); await pg.click('[data-c=vram]'); await pg.wait_for_timeout(300)
            print(name, 'comp detail:', 'VRAM' in await pg.inner_text('#content'))
            await pg.click('[data-tab=dis]')
            for _ in range(3): await pg.click('#next'); await pg.wait_for_timeout(150)
            await pg.wait_for_timeout(1200); await pg.screenshot(path=f'/tmp/gpulab_{name}_dis.png')
            await pg.click('[data-tab=lab]'); await pg.click('[data-sc=power]'); await pg.wait_for_timeout(200)
            for t in ['meter','thermal','temps','fans','rails','visual','power','mem','stress']:
                await pg.click(f'[data-t={t}]'); await pg.wait_for_timeout(150)
            await pg.click('[data-t=thermal]'); await pg.wait_for_timeout(300)
            await pg.screenshot(path=f'/tmp/gpulab_{name}_lab.png')
            await pg.check('input[name=cause] >> nth=0'); await pg.click('#dx button[type=submit]'); await pg.wait_for_timeout(200)
            print(name, 'result shown:', 'diagnóstico razonado' in (await pg.inner_text('#content')).lower())
            # avanzado
            await pg.click('#list'); await pg.click('.seg [data-l=adv]'); await pg.click('[data-sc=heat]')
            for n in ['cause','comp','fix']: await pg.check(f'input[name={n}] >> nth=0')
            await pg.click('#dx button[type=submit]'); await pg.wait_for_timeout(200)
            print(name, 'adv result:', 'Reparación recomendada' in await pg.inner_text('#content'))
            await pg.click('[data-tab=learn]'); await pg.click('#qz'); await pg.click('.optb >> nth=0'); await pg.click('#nx')
            await pg.click('[data-tab=learn]'); await pg.wait_for_timeout(100)
            await pg.click('[data-tab=prog]'); print(name, 'prog:', 'puntos totales' in await pg.inner_text('#content'))
            for g in ['rtx4060','rx7900xtx','arca770','generic','rtx4090']:
                await pg.select_option('#gpuSel', g); await pg.wait_for_timeout(300)
            await pg.screenshot(path=f'/tmp/gpulab_{name}_final.png')
            await pg.close()
        await b.close()
    print('ERRORES:', errs if errs else 'ninguno')
asyncio.run(main())
