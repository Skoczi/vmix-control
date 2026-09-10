import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,LANGUAGES,isLanguage,translate} from '../lib/i18n/index.ts';
const placeholders=(s:string)=>[...s.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();
test('all ten languages have complete translations and matching parameters',()=>{
 assert.equal(LANGUAGES.length,10);
 for(const row of catalog){assert.equal(row.length,10);for(const translation of row){assert.ok(translation.trim());assert.deepEqual(placeholders(translation),placeholders(row[1]),row[1]);}}
 assert.equal(isLanguage('en'),true);assert.equal(isLanguage('zh'),false);assert.equal(isLanguage(null),false);
});
test('UI keys translate and source/profile names are preserved as parameters',()=>{
 assert.equal(translate('Ustawienia','en'),'Settings');assert.equal(translate('Ustawienia','de'),'Einstellungen');assert.equal(translate('Ustawienia','ru'),'Настройки');
 const name='Kamera na rynku <AUX> {name}';
 for(const [language] of LANGUAGES){assert.ok(translate('Zapisano stanowisko „{name}”.',language,{name}).includes(name));assert.equal(translate(name,language),name);}
});
test('server messages localize without changing addresses, codes or details',()=>{
 assert.equal(translate('vMix zwrócił błąd 409. Sprawdź input, mix i konfigurację przejścia.','en'),'vMix error 409. Check input, mix and transition.');
 assert.equal(translate('Nie można odczytać vMix. Brak połączenia z vMix.','en'),'Cannot read vMix. Could not connect to vMix.');
 assert.ok(translate('Ten dashboard jest połączony z http://127.0.0.1:8088/api/. Użyj tego adresu. Aby zmienić komputer vMix, uruchom ponownie serwer dashboardu.','de').includes('http://127.0.0.1:8088/api/'));
 assert.equal(translate('Czas: 1–10000 ms','en'),'Duration must be 1–10000 ms.');
 assert.equal(translate('Settings','pl'),'Ustawienia');
});
