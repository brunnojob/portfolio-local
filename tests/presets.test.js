import test from 'node:test';
import assert from 'node:assert/strict';
import {blank,sectors} from '../src/model.js';
import {applyPreset} from '../src/presets.js';
test('each field offers bilingual editable outlines without overwriting existing content',()=>{for(const sector of Object.keys(sectors))for(const lang of ['pt','en']){const s=blank();s.sector=sector;s.lang=lang;s[lang].experience='Existing experience';assert.ok(applyPreset(s)>0);assert.equal(s[lang].experience,'Existing experience');assert.ok(s[lang].title);assert.ok(s[lang].projects);assert.equal(applyPreset(s),0);}});
