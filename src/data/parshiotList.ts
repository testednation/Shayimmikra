/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ParashaMetadata } from '../types';

export const ALL_PARSHIOT: ParashaMetadata[] = [
  // Genesis / בראשית
  { id: 'Bereshit', nameEn: 'Bereshit', nameHe: 'בראשית', chumashEn: 'Genesis', chumashHe: 'בראשית', ref: 'Genesis 1:1-6:8', heRef: 'בראשית א:א-ו:ח', versesTotal: 146 },
  { id: 'Noach', nameEn: 'Noach', nameHe: 'נח', chumashEn: 'Genesis', chumashHe: 'בראשית', ref: 'Genesis 6:9-11:32', heRef: 'בראשית ו:ט-יא:לב', versesTotal: 153 },
  { id: 'Lech-Lecha', nameEn: 'Lech-Lecha', nameHe: 'לך לך', chumashEn: 'Genesis', chumashHe: 'בראשית', ref: 'Genesis 12:1-17:27', heRef: 'בראשית יב:א-יז:כז', versesTotal: 126 },
  { id: 'Vayera', nameEn: 'Vayera', nameHe: 'וירא', chumashEn: 'Genesis', chumashHe: 'בראשית', ref: 'Genesis 18:1-22:24', heRef: 'בראשית יח:א-כב:כד', versesTotal: 147 },
  { id: 'Chayei Sara', nameEn: 'Chayei Sara', nameHe: 'חיי שרה', chumashEn: 'Genesis', chumashHe: 'בראשית', ref: 'Genesis 23:1-25:18', heRef: 'בראשית כג:א-כה:יח', versesTotal: 105 },
  { id: 'Toldot', nameEn: 'Toldot', nameHe: 'תולדות', chumashEn: 'Genesis', chumashHe: 'בראשית', ref: 'Genesis 25:19-28:9', heRef: 'בראשית כה:יט-כח:ט', versesTotal: 106 },
  { id: 'Vayetzei', nameEn: 'Vayetzei', nameHe: 'ויצא', chumashEn: 'Genesis', chumashHe: 'בראשית', ref: 'Genesis 28:10-32:3', heRef: 'בראשית כח:י-לב:ג', versesTotal: 148 },
  { id: 'Vayishlach', nameEn: 'Vayishlach', nameHe: 'וישלח', chumashEn: 'Genesis', chumashHe: 'בראשית', ref: 'Genesis 32:4-36:43', heRef: 'בראשית לב:ד-לו:מג', versesTotal: 153 },
  { id: 'Vayeshev', nameEn: 'Vayeshev', nameHe: 'וישב', chumashEn: 'Genesis', chumashHe: 'בראשית', ref: 'Genesis 37:1-40:23', heRef: 'בראשית לז:א-מ:כג', versesTotal: 112 },
  { id: 'Miketz', nameEn: 'Miketz', nameHe: 'מקץ', chumashEn: 'Genesis', chumashHe: 'בראשית', ref: 'Genesis 41:1-44:17', heRef: 'בראשית מא:א-מד:יז', versesTotal: 146 },
  { id: 'Vayigash', nameEn: 'Vayigash', nameHe: 'ויגש', chumashEn: 'Genesis', chumashHe: 'בראשית', ref: 'Genesis 44:18-47:27', heRef: 'בראשית מד:יח-מז:כז', versesTotal: 106 },
  { id: 'Vayechi', nameEn: 'Vayechi', nameHe: 'ויחי', chumashEn: 'Genesis', chumashHe: 'בראשית', ref: 'Genesis 47:28-50:26', heRef: 'בראשית מז:כח-נ:כו', versesTotal: 85 },

  // Exodus / שמות
  { id: 'Shemot', nameEn: 'Shemot', nameHe: 'שמות', chumashEn: 'Exodus', chumashHe: 'שמות', ref: 'Exodus 1:1-6:1', heRef: 'שמות א:א-ו:א', versesTotal: 124 },
  { id: 'Vaera', nameEn: 'Vaera', nameHe: 'וארא', chumashEn: 'Exodus', chumashHe: 'שמות', ref: 'Exodus 6:2-9:35', heRef: 'שמות ו:ב-ט:לה', versesTotal: 121 },
  { id: 'Bo', nameEn: 'Bo', nameHe: 'בא', chumashEn: 'Exodus', chumashHe: 'שמות', ref: 'Exodus 10:1-13:16', heRef: 'שמות י:א-יג:טז', versesTotal: 106 },
  { id: 'Beshalach', nameEn: 'Beshalach', nameHe: 'בשלח', chumashEn: 'Exodus', chumashHe: 'שמות', ref: 'Exodus 13:17-17:16', heRef: 'שמות יג:יז-יז:טז', versesTotal: 116 },
  { id: 'Yitro', nameEn: 'Yitro', nameHe: 'יתרו', chumashEn: 'Exodus', chumashHe: 'שמות', ref: 'Exodus 18:1-20:23', heRef: 'שמות יח:א-כ:כג', versesTotal: 72 },
  { id: 'Mishpatim', nameEn: 'Mishpatim', nameHe: 'משפטים', chumashEn: 'Exodus', chumashHe: 'שמות', ref: 'Exodus 21:1-24:18', heRef: 'שמות כא:א-כד:יח', versesTotal: 118 },
  { id: 'Terumah', nameEn: 'Terumah', nameHe: 'תרומה', chumashEn: 'Exodus', chumashHe: 'שמות', ref: 'Exodus 25:1-27:19', heRef: 'שמות כה:א-כז:יט', versesTotal: 96 },
  { id: 'Tetzaveh', nameEn: 'Tetzaveh', nameHe: 'תצוה', chumashEn: 'Exodus', chumashHe: 'שמות', ref: 'Exodus 27:20-30:10', heRef: 'שמות כז:כ-ל:י', versesTotal: 101 },
  { id: 'Ki Tisa', nameEn: 'Ki Tisa', nameHe: 'כי תשא', chumashEn: 'Exodus', chumashHe: 'שמות', ref: 'Exodus 30:11-34:35', heRef: 'שמות ל:יא-לד:לה', versesTotal: 139 },
  { id: 'Vayakhel', nameEn: 'Vayakhel', nameHe: 'ויקהל', chumashEn: 'Exodus', chumashHe: 'שמות', ref: 'Exodus 35:1-38:20', heRef: 'שמות לה:א-לח:כ', versesTotal: 122 },
  { id: 'Pekudei', nameEn: 'Pekudei', nameHe: 'פקודי', chumashEn: 'Exodus', chumashHe: 'שמות', ref: 'Exodus 38:21-40:38', heRef: 'שמות לח:כא-מ:לח', versesTotal: 92 },

  // Leviticus / ויקרא
  { id: 'Vayikra', nameEn: 'Vayikra', nameHe: 'ויקרא', chumashEn: 'Leviticus', chumashHe: 'ויקרא', ref: 'Leviticus 1:1-5:26', heRef: 'ויקרא א:א-ה:כו', versesTotal: 111 },
  { id: 'Tzav', nameEn: 'Tzav', nameHe: 'צו', chumashEn: 'Leviticus', chumashHe: 'ויקרא', ref: 'Leviticus 6:1-8:36', heRef: 'ויקרא ו:א-ח:לו', versesTotal: 97 },
  { id: 'Shemini', nameEn: 'Shemini', nameHe: 'שמיני', chumashEn: 'Leviticus', chumashHe: 'ויקרא', ref: 'Leviticus 9:1-11:47', heRef: 'ויקרא ט:א-יא:מז', versesTotal: 91 },
  { id: 'Tazria', nameEn: 'Tazria', nameHe: 'תזריע', chumashEn: 'Leviticus', chumashHe: 'ויקרא', ref: 'Leviticus 12:1-13:59', heRef: 'ויקרא יב:א-יג:נט', versesTotal: 67 },
  { id: 'Metzora', nameEn: 'Metzora', nameHe: 'מצורע', chumashEn: 'Leviticus', chumashHe: 'ויקרא', ref: 'Leviticus 14:1-15:33', heRef: 'ויקרא יד:א-טו:לג', versesTotal: 90 },
  { id: 'Achrei Mot', nameEn: 'Achrei Mot', nameHe: 'אחרי מות', chumashEn: 'Leviticus', chumashHe: 'ויקרא', ref: 'Leviticus 16:1-18:30', heRef: 'ויקרא טז:א-יח:ל', versesTotal: 80 },
  { id: 'Kedoshim', nameEn: 'Kedoshim', nameHe: 'קדושים', chumashEn: 'Leviticus', chumashHe: 'ויקרא', ref: 'Leviticus 19:1-20:27', heRef: 'ויקרא יט:א-כ:כז', versesTotal: 64 },
  { id: 'Emor', nameEn: 'Emor', nameHe: 'אמור', chumashEn: 'Leviticus', chumashHe: 'ויקרא', ref: 'Leviticus 21:1-24:23', heRef: 'ויקרא כא:א-כד:כג', versesTotal: 124 },
  { id: 'Behar', nameEn: 'Behar', nameHe: 'בהר', chumashEn: 'Leviticus', chumashHe: 'ויקרא', ref: 'Leviticus 25:1-26:2', heRef: 'ויקרא כה:א-כו:ב', versesTotal: 57 },
  { id: 'Bechukotai', nameEn: 'Bechukotai', nameHe: 'בחוקותי', chumashEn: 'Leviticus', chumashHe: 'ויקרא', ref: 'Leviticus 26:3-27:34', heRef: 'ויקרא כו:ג-כז:לד', versesTotal: 73 },

  // Numbers / במדבר
  { id: 'Bamidbar', nameEn: 'Bamidbar', nameHe: 'במדבר', chumashEn: 'Numbers', chumashHe: 'במדבר', ref: 'Numbers 1:1-4:20', heRef: 'במדבר א:א-ד:כ', versesTotal: 159 },
  { id: 'Nasso', nameEn: 'Nasso', nameHe: 'נשא', chumashEn: 'Numbers', chumashHe: 'במדבר', ref: 'Numbers 4:21-7:89', heRef: 'במדבר ד:כא-ז:פט', versesTotal: 176 },
  { id: 'Beha\'alotcha', nameEn: 'Beha\'alotcha', nameHe: 'בהעלותך', chumashEn: 'Numbers', chumashHe: 'במדבר', ref: 'Numbers 8:1-12:16', heRef: 'במדבר ח:א-יב:טז', versesTotal: 136 },
  { id: 'Sh\'lach', nameEn: 'Shelach', nameHe: 'שלח לך', chumashEn: 'Numbers', chumashHe: 'במדבר', ref: 'Numbers 13:1-15:41', heRef: 'במדבר יג:א-טו:מא', versesTotal: 119 },
  { id: 'Korach', nameEn: 'Korach', nameHe: 'קורח', chumashEn: 'Numbers', chumashHe: 'במדבר', ref: 'Numbers 16:1-18:32', heRef: 'במדבר טז:א-יח:לב', versesTotal: 95 },
  { id: 'Chukat', nameEn: 'Chukat', nameHe: 'חוקת', chumashEn: 'Numbers', chumashHe: 'במדבר', ref: 'Numbers 19:1-22:1', heRef: 'במדבר יט:א-כב:א', versesTotal: 87 },
  { id: 'Balak', nameEn: 'Balak', nameHe: 'בלק', chumashEn: 'Numbers', chumashHe: 'במדבר', ref: 'Numbers 22:2-25:9', heRef: 'במדבר כב:ב-כה:ט', versesTotal: 104 },
  { id: 'Pinchas', nameEn: 'Pinchas', nameHe: 'פינחס', chumashEn: 'Numbers', chumashHe: 'במדבר', ref: 'Numbers 25:10-30:1', heRef: 'במדבר כה:י-ל:א', versesTotal: 168 },
  { id: 'Matot', nameEn: 'Matot', nameHe: 'מטות', chumashEn: 'Numbers', chumashHe: 'במדבר', ref: 'Numbers 30:2-32:42', heRef: 'במדבר ל:ב-לב:מב', versesTotal: 112 },
  { id: 'Masei', nameEn: 'Masei', nameHe: 'מסעי', chumashEn: 'Numbers', chumashHe: 'במדבר', ref: 'Numbers 33:1-36:13', heRef: 'במדבר לג:א-לו:יג', versesTotal: 132 },

  // Deuteronomy / דברים
  { id: 'Devarim', nameEn: 'Devarim', nameHe: 'דברים', chumashEn: 'Deuteronomy', chumashHe: 'דברים', ref: 'Deuteronomy 1:1-3:22', heRef: 'דברים א:א-ג:כב', versesTotal: 105 },
  { id: 'Vaetchanan', nameEn: 'Vaetchanan', nameHe: 'ואתחנן', chumashEn: 'Deuteronomy', chumashHe: 'דברים', ref: 'Deuteronomy 3:23-7:11', heRef: 'דברים ג:כג-ז:יא', versesTotal: 118 },
  { id: 'Eikev', nameEn: 'Eikev', nameHe: 'עקב', chumashEn: 'Deuteronomy', chumashHe: 'דברים', ref: 'Deuteronomy 7:12-11:25', heRef: 'דברים ז:יב-יא:כה', versesTotal: 111 },
  { id: 'Re\'eh', nameEn: 'Re\'eh', nameHe: 'ראה', chumashEn: 'Deuteronomy', chumashHe: 'דברים', ref: 'Deuteronomy 11:26-16:17', heRef: 'דברים יא:כו-טז:יז', versesTotal: 126 },
  { id: 'Shoftim', nameEn: 'Shoftim', nameHe: 'שופטים', chumashEn: 'Deuteronomy', chumashHe: 'דברים', ref: 'Deuteronomy 16:18-21:9', heRef: 'דברים טז:יח-כא:ט', versesTotal: 97 },
  { id: 'Ki Teitzei', nameEn: 'Ki Teitzei', nameHe: 'כי תצא', chumashEn: 'Deuteronomy', chumashHe: 'דברים', ref: 'Deuteronomy 21:10-25:19', heRef: 'דברים כא:י-כה:יט', versesTotal: 110 },
  { id: 'Ki Tavo', nameEn: 'Ki Tavo', nameHe: 'כי תבוא', chumashEn: 'Deuteronomy', chumashHe: 'דברים', ref: 'Deuteronomy 26:1-29:8', heRef: 'דברים כו:א-כט:ח', versesTotal: 122 },
  { id: 'Nitzavim', nameEn: 'Nitzavim', nameHe: 'ניצבים', chumashEn: 'Deuteronomy', chumashHe: 'דברים', ref: 'Deuteronomy 29:9-30:20', heRef: 'דברים כט:ט-ל:כ', versesTotal: 40 },
  { id: 'Vayeilech', nameEn: 'Vayeilech', nameHe: 'וילך', chumashEn: 'Deuteronomy', chumashHe: 'דברים', ref: 'Deuteronomy 31:1-31:30', heRef: 'דברים לא:א-לא:ל', versesTotal: 30 },
  { id: 'Ha\'Azinu', nameEn: 'Ha\'Azinu', nameHe: 'האזינו', chumashEn: 'Deuteronomy', chumashHe: 'דברים', ref: 'Deuteronomy 32:1-32:52', heRef: 'דברים לב:א-לב:נב', versesTotal: 52 },
  { id: 'V\'Zot HaBerachah', nameEn: 'V\'Zot HaBerachah', nameHe: 'וזאת הברכה', chumashEn: 'Deuteronomy', chumashHe: 'דברים', ref: 'Deuteronomy 33:1-34:12', heRef: 'דברים לג:א-לד:יב', versesTotal: 41 },
];
