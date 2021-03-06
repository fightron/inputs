import { expect } from 'chai'
import { InputRouter } from '../lib/InputRouter'
import { InputSequence } from '../lib/InputSequence'
import { Counter } from '@fightron/utils/Counter'
import {
  DIRECTION_NEUTRAL,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_DOWN,
  DIRECTION_DOWN_RIGHT,
  BUTTON_A,
  DIRECTION_DOWN_LEFT
} from '../lib/constants'

describe('InputRouter', function () {
  before(function () {
    this.counter = new Counter()
    this.s236A = new InputSequence('236A')
    this.s236A.register(DIRECTION_DOWN)
    this.s236A.register(DIRECTION_DOWN_RIGHT)
    this.s236A.register(DIRECTION_RIGHT)
    this.s236A.register(BUTTON_A)
    this.s236A.priority = 5
    this.s236236A = new InputSequence('236236A')
    this.s236236A.register(DIRECTION_DOWN)
    this.s236236A.register(DIRECTION_DOWN_RIGHT)
    this.s236236A.register(DIRECTION_RIGHT)
    this.s236236A.register(DIRECTION_DOWN)
    this.s236236A.register(DIRECTION_DOWN_RIGHT)
    this.s236236A.register(DIRECTION_RIGHT)
    this.s236236A.register(BUTTON_A)
    this.s236236A.priority = 10
    this.s6 = new InputSequence('6')
    this.s6.register(DIRECTION_RIGHT)
    this.s6.priority = 3
    this.s4 = new InputSequence('4')
    this.s4.register(DIRECTION_LEFT)
    this.s4.priority = 2
    this.s5 = new InputSequence('5')
    this.s5.register(DIRECTION_NEUTRAL)
    this.router = new InputRouter()
    this.router.register(this.s5)
    this.router.register(this.s6)
    this.router.register(this.s4)
    this.router.register(this.s236A)
    this.router.register(this.s236236A)
    this.router.counter = this.counter
  })

  it('propagates counters to all steps', function () {
    var q, s
    for (q of this.router.sequences) {
      for (s of q.steps) {
        expect(s.counter).to.equal(this.counter)
      }
    }
  })

  it('sorts sequences by priority', function () {
    var sequences = this.router.sequences
    expect(sequences[0].id).to.equal('236236A')
    expect(sequences[1].id).to.equal('236A')
    expect(sequences[2].id).to.equal('6')
    expect(sequences[3].id).to.equal('4')
    expect(sequences[4].id).to.equal('5')
  })

  describe('#feed', function () {
    it('returns sequence ID on completion', function () {
      var router = this.router
      expect(router.feed(DIRECTION_NEUTRAL)).to.equal('5')
      expect(router.feed(DIRECTION_LEFT)).to.equal('4')
      expect(router.feed(DIRECTION_RIGHT)).to.equal('6')
      expect(router.feed(DIRECTION_DOWN)).to.equal(false)
      expect(router.feed(DIRECTION_DOWN_RIGHT)).to.equal(false)
      expect(router.feed(DIRECTION_RIGHT)).to.equal('6')
      expect(router.feed(BUTTON_A)).to.equal('236A')
      expect(router.feed(DIRECTION_DOWN)).to.equal(false)
      expect(router.feed(DIRECTION_DOWN_RIGHT)).to.equal(false)
      expect(router.feed(DIRECTION_RIGHT)).to.equal('6')
      expect(router.feed(BUTTON_A)).to.equal('236236A')
    })

    context('with fighter at 2P orientation', function () {
      before(function () {
        this.router.fighter = { orientation: -1 }
        this.counter.set(300) // expire all steps
      })

      after(function () {
        this.router.fighter = null
      })

      it('flips commands horizontally', function () {
        var router = this.router
        expect(router.feed(DIRECTION_NEUTRAL)).to.equal('5')
        expect(router.feed(DIRECTION_LEFT)).to.equal('6')
        expect(router.feed(DIRECTION_RIGHT)).to.equal('4')
        expect(router.feed(DIRECTION_DOWN)).to.equal(false)
        expect(router.feed(DIRECTION_DOWN_RIGHT)).to.equal(false)
        expect(router.feed(DIRECTION_RIGHT)).to.equal('4')
        expect(router.feed(BUTTON_A)).to.equal(false)
        expect(router.feed(DIRECTION_DOWN)).to.equal(false)
        expect(router.feed(DIRECTION_DOWN_RIGHT)).to.equal(false)
        expect(router.feed(DIRECTION_RIGHT)).to.equal('4')
        expect(router.feed(BUTTON_A)).to.equal(false)
        expect(router.feed(DIRECTION_DOWN)).to.equal(false)
        expect(router.feed(DIRECTION_DOWN_LEFT)).to.equal(false)
        expect(router.feed(DIRECTION_LEFT)).to.equal('6')
        expect(router.feed(BUTTON_A)).to.equal('236A')
        expect(router.feed(DIRECTION_DOWN)).to.equal(false)
        expect(router.feed(DIRECTION_DOWN_LEFT)).to.equal(false)
        expect(router.feed(DIRECTION_LEFT)).to.equal('6')
        expect(router.feed(BUTTON_A)).to.equal('236236A')
      })
    })
  })
})
