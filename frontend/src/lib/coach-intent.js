// Which typed Coach messages are a request to look at, or change, the plan.
//
// The chat answers questions ("how do I run back-off sets?", "hello"). A message that asks the
// Coach to review or rework the plan goes down the review path instead, the way the quick
// chips do. This is a keyword check in English, Turkish, and several other common languages:
// a message it does not recognise is answered in the chat, and the Coach points to the review
// buttons. English is matched on a plain lower-case and Turkish on a Turkish lower-case, because
// the Turkish rule turns "I" into a dotless "ı" and would break the English words.
const EN = [
  /\b(review|re-?evaluate|assess|audit|analy[sz]e)\b.{0,30}\b(training|plan|routines?|program(me)?|progress|workouts?|split)\b/,
  /\b(change|modify|adjust|update|edit|redo|rebuild|rewrite|rework|restructure|fix|improve|optimi[sz]e|tweak)\b.{0,30}\b(plan|routines?|program(me)?|split|schedule)\b/,
  /\b(new|fresh|different)\s+(plan|routine|program(me)?|split)\b/,
  /\b(make|build|create|design|write|give)\s+(me\s+)?(a|an|my)?\s*(new\s+|fresh\s+)?(plan|routine|program(me)?|split)\b/,
  /\b(add|remove|drop|replace|swap)\b.{0,40}\b(to|from|in|of)\s+(my\s+)?(plan|routines?)\b/
]
const TR = [
  /(plan|program|rutin|antrenman)\w*.{0,30}(değiştir|güncelle|düzelt|yenile|incele|gözden geçir|iyileştir|baştan|yeniden|düzenle)/,
  /(değiştir|güncelle|düzelt|yenile|incele|gözden geçir|iyileştir|düzenle).{0,30}(plan|program|rutin)/,
  /(yeni|sıfırdan|farklı)\s+(bir\s+)?(plan|program|rutin)/,
  /(plan|program|rutin)\w*\s+(yap|hazırla|oluştur|çıkar)/
]
// French — revoir/modifier/créer un plan/programme/routine
const FR = [
  /\b(revoir|réévaluer|analyser|auditer)\b.{0,30}\b(entraînement|plan|programme|routine|séances?)\b/,
  /\b(changer|modifier|ajuster|mettre à jour|améliorer|refaire|réécrire|restructurer|optimiser)\b.{0,30}\b(plan|programme|routine|planning)\b/,
  /\b(nouveau|nouvelle|différent[e]?)\s+(plan|programme|routine)\b/,
  /\b(crée[rz]?|fais?|construi[st]|écri[st]|donne[rz]?)\s+(moi\s+)?(un|une|mon|ma)\s*(nouveau\s+|nouvelle\s+)?(plan|programme|routine)\b/
]
// German — überprüfen/ändern/erstellen eines Plans/Programms/Routine
const DE = [
  /\b(überprüf|analysier|bewert|beurteil)\w*.{0,30}\b(training|plan|programm|routine|einheiten?)\b/,
  /\b(änder|anpass|aktualisier|überarbeit|verbessere?|optimier|überscreib)\w*.{0,30}\b(plan|programm|routine|trainingsplan)\b/,
  /\b(neuen?|neues|frischen?|anderen?)\s+(plan|programm|routine)\b/,
  /\b(erstell|mach|bau|schreib|gib)\s+(mir\s+)?(einen?|meinen?)\s*(neuen?\s+)?(plan|programm|routine)\b/
]
// Spanish — revisar/cambiar/crear un plan/programa/rutina
const ES = [
  /\b(revisa[r]?|analiza[r]?|evalúa[r]?|audita[r]?)\b.{0,30}\b(entrenamiento|plan|programa|rutina|sesiones?)\b/,
  /\b(cambia[r]?|modifica[r]?|ajusta[r]?|actualiza[r]?|mejora[r]?|rehace[r]?|optimiza[r]?)\b.{0,30}\b(plan|programa|rutina|horario)\b/,
  /\b(nuevo|nueva|diferente)\s+(plan|programa|rutina)\b/,
  /\b(crea[r]?|haz|construye|escribe|dame)\s+(me\s+)?(un|una|mi)\s*(nuevo\s+|nueva\s+)?(plan|programa|rutina)\b/
]
// Italian — rivedere/modificare/creare un piano/programma/routine
const IT = [
  /\b(rivedi|analizza|valuta|esamina)\b.{0,30}\b(allenamento|piano|programma|routine|sessioni?)\b/,
  /\b(cambia|modifica|aggiorna|migliora|rifai|ottimizza|riscrivi)\b.{0,30}\b(piano|programma|routine|schedulazione)\b/,
  /\b(nuovo|nuova|diverso|diversa)\s+(piano|programma|routine)\b/,
  /\b(crea[i]?|fai|costruisci|scrivi|dammi)\s+(un|una|il mio|la mia)\s*(nuovo\s+|nuova\s+)?(piano|programma|routine)\b/
]
// Portuguese — rever/mudar/criar um plano/programa/rotina
const PT = [
  /\b(rever|analisar|avaliar|auditar)\b.{0,30}\b(treino|plano|programa|rotina|sessões?)\b/,
  /\b(mudar|modificar|ajustar|atualizar|melhorar|refazer|otimizar|reescrever)\b.{0,30}\b(plano|programa|rotina|horário)\b/,
  /\b(novo|nova|diferente)\s+(plano|programa|rotina)\b/,
  /\b(cria[r]?|faz|constrói|escreve|me dá)\s+(um|uma|meu|minha)\s*(novo\s+|nova\s+)?(plano|programa|rotina)\b/
]
// Russian — пересмотреть/изменить/создать план/программу/режим
const RU = [
  /(пересмотр|проанализир|оцен|проверь|измен|скорректируй|обнов|улучш|перепиш|оптимизир)\w*.{0,30}(план|программ|режим|тренировк)/,
  /(план|программ|режим|тренировк)\w*.{0,30}(пересмотр|измен|скорректируй|обнов|улучш|перепиш|оптимизир)\w*/,
  /(новый|новую|другой|другую|свежий|свежую)\s+(план|программ|режим)/,
  /(создай|составь|напиш|сделай|дай)\s+(мне\s+)?(новый\s+|новую\s+)?(план|программ|режим)/
]
// Japanese — プラン/プログラム/ルーティンを見直す/変更する/作る
const JA = [
  /(プラン|プログラム|ルーティン|トレーニング計画).{0,20}(見直|変更|修正|改善|作成|作って|考えて)/,
  /(見直|変更|修正|改善|最適化).{0,20}(プラン|プログラム|ルーティン|トレーニング計画)/,
  /(新しい|新規|別の)\s*(プラン|プログラム|ルーティン)/,
  /(作って|作成して|考えて|立てて).{0,20}(プラン|プログラム|ルーティン|トレーニング計画)/
]
// Chinese (simplified + traditional) — 审查/修改/制定训练计划
const ZH = [
  /(审查|分析|评估|检查|修改|调整|更新|改善|重写|优化|审閱|修改|調整|優化).{0,20}(计划|训练|程序|例行|計劃|訓練|程序|例行)/,
  /(计划|训练|程序|例行|計劃|訓練|程序|例行).{0,20}(审查|修改|调整|改善|更新|优化|審查|修改|調整|改善|更新|優化)/,
  /(新的|重新|不同的|新)\s*(计划|训练|程序|例行|計劃|訓練|程序|例行)/,
  /(制定|创建|写|给我|幫我|制訂|創建|寫|給我).{0,10}(计划|训练|程序|例行|計劃|訓練|程序|例行)/
]

export function wantsReview(message) {
  const raw = String(message || '').trim()
  if (!raw) return false
  const en = raw.toLowerCase()
  const tr = raw.toLocaleLowerCase('tr')
  return EN.some(r => r.test(en)) || TR.some(r => r.test(tr))
    || FR.some(r => r.test(en)) || DE.some(r => r.test(en))
    || ES.some(r => r.test(en)) || IT.some(r => r.test(en))
    || PT.some(r => r.test(en)) || RU.some(r => r.test(raw))
    || JA.some(r => r.test(raw)) || ZH.some(r => r.test(raw))
}
