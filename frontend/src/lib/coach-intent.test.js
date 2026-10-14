import { describe, it, expect } from 'vitest'
import { wantsReview } from './coach-intent.js'

describe('wantsReview', () => {
  it('sends plan requests to the review', () => {
    for (const m of [
      'Change my plan please', 'review my training', 'Can you improve my routine?', 'I want a new program',
      'Build me a fresh plan', 'swap bench press in my routine',
      'planımı değiştir', 'antrenmanımı incele', 'yeni bir program istiyorum', 'Rutinimi güncelle'
    ]) expect(wantsReview(m), m).toBe(true)
  })
  it('keeps questions and small talk in the chat', () => {
    for (const m of [
      'Hello', 'How do I do back-off sets?', 'What weight should I use for the next set?',
      'My shoulder feels tight, what should I do?', 'rest time between sets?', 'back-off seti nasıl yapmalıyım', 'merhaba', ''
    ]) expect(wantsReview(m), m).toBe(false)
  })
})
