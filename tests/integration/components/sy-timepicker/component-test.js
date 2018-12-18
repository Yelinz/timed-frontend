import { find, fillIn, blur } from '@ember/test-helpers'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { setupComponentTest } from 'ember-mocha'
import hbs from 'htmlbars-inline-precompile'
import moment from 'moment'
import $ from 'jquery'

const event = $.Event

describe('Integration | Component | sy timepicker', function() {
  setupComponentTest('sy-timepicker', {
    integration: true
  })

  it('renders', function() {
    this.set('value', moment())

    this.render(hbs`{{sy-timepicker value=value}}`)

    expect(find('input').value).to.equal(moment().format('HH:mm'))
  })

  it('can change the value', async function() {
    this.set(
      'value',
      moment({
        h: 12,
        m: 30
      })
    )

    this.render(
      hbs`{{sy-timepicker value=value on-change=(action (mut value))}}`
    )

    await fillIn('input', '13:15')
    await blur('input')

    expect(this.get('value').hour()).to.equal(13)
    expect(this.get('value').minute()).to.equal(15)
  })

  it("can't set an invalid value", async function() {
    this.set(
      'value',
      moment({
        h: 12,
        m: 30
      })
    )

    this.render(
      hbs`{{sy-timepicker value=value on-change=(action (mut value))}}`
    )

    await fillIn('input', '24:15')
    await blur('input')

    expect(this.get('value').hour()).to.equal(12)
    expect(this.get('value').minute()).to.equal(30)
  })

  it('can only input digits and colons', async function() {
    this.set('value', null)

    this.render(
      hbs`{{sy-timepicker value=value on-change=(action (mut value))}}`
    )

    await fillIn('input', 'xx:xx')
    await blur('input')

    expect(this.get('value')).to.be.null

    await fillIn('input', '01:30')
    await blur('input')

    expect(this.get('value')).to.not.be.null
  })

  it('can increase minutes per arrow', function() {
    this.set(
      'value',
      moment({
        h: 12,
        m: 15
      })
    )

    this.render(
      hbs`{{sy-timepicker value=value on-change=(action (mut value))}}`
    )

    this.$('input').trigger(event('keydown', { key: 'ArrowUp', keyCode: 38 }))

    expect(this.get('value').hour()).to.equal(12)
    expect(this.get('value').minute()).to.equal(30)
  })

  it('can decrease minutes per arrow', function() {
    this.set(
      'value',
      moment({
        h: 12,
        m: 15
      })
    )

    this.render(
      hbs`{{sy-timepicker value=value on-change=(action (mut value))}}`
    )

    this.$('input').trigger(event('keydown', { key: 'ArrowDown', keyCode: 40 }))

    expect(this.get('value').hour()).to.equal(12)
    expect(this.get('value').minute()).to.equal(0)
  })

  it('can increase hours per arrow with shift', function() {
    this.set(
      'value',
      moment({
        h: 12,
        m: 15
      })
    )

    this.render(
      hbs`{{sy-timepicker value=value on-change=(action (mut value))}}`
    )

    this.$('input').trigger(
      event('keydown', { key: 'ArrowUp', keyCode: 38, shiftKey: true })
    )

    expect(this.get('value').hour()).to.equal(13)
    expect(this.get('value').minute()).to.equal(15)
  })

  it('can decrease minutes per arrow with shift', function() {
    this.set(
      'value',
      moment({
        h: 12,
        m: 15
      })
    )

    this.render(
      hbs`{{sy-timepicker value=value on-change=(action (mut value))}}`
    )

    this.$('input').trigger(
      event('keydown', { key: 'ArrowDown', keyCode: 40, shiftKey: true })
    )

    expect(this.get('value').hour()).to.equal(11)
    expect(this.get('value').minute()).to.equal(15)
  })

  it('can increase hours per arrow with ctrl', function() {
    this.set(
      'value',
      moment({
        h: 12,
        m: 15
      })
    )

    this.render(
      hbs`{{sy-timepicker value=value on-change=(action (mut value))}}`
    )

    this.$('input').trigger(
      event('keydown', { key: 'ArrowUp', keyCode: 38, ctrlKey: true })
    )

    expect(this.get('value').hour()).to.equal(13)
    expect(this.get('value').minute()).to.equal(15)
  })

  it('can decrease minutes per arrow with ctrl', function() {
    this.set(
      'value',
      moment({
        h: 12,
        m: 15
      })
    )

    this.render(
      hbs`{{sy-timepicker value=value on-change=(action (mut value))}}`
    )

    this.$('input').trigger(
      event('keydown', { key: 'ArrowDown', keyCode: 40, ctrlKey: true })
    )

    expect(this.get('value').hour()).to.equal(11)
    expect(this.get('value').minute()).to.equal(15)
  })

  it("can't change day", function() {
    this.set(
      'value',
      moment({
        h: 23,
        m: 45
      })
    )

    this.render(
      hbs`{{sy-timepicker value=value on-change=(action (mut value))}}`
    )

    this.$('input').trigger(event('keydown', { key: 'ArrowUp', keyCode: 38 }))

    expect(this.get('value').hour()).to.equal(23)
    expect(this.get('value').minute()).to.equal(45)
  })

  it("can't be bigger than max or smaller than min", function() {
    this.set(
      'value',
      moment({
        h: 12,
        m: 30
      })
    )

    this.set(
      'min',
      moment({
        h: 12,
        m: 30
      })
    )

    this.set(
      'max',
      moment({
        h: 12,
        m: 30
      })
    )

    this.render(
      hbs`{{sy-timepicker min=min max=max value=value on-change=(action (mut value))}}`
    )

    this.$('input').trigger(event('keydown', { key: 'ArrowUp', keyCode: 38 }))

    expect(this.get('value').hour()).to.equal(12)
    expect(this.get('value').minute()).to.equal(30)

    this.$('input').trigger(event('keydown', { key: 'ArrowDown', keyCode: 40 }))

    expect(this.get('value').hour()).to.equal(12)
    expect(this.get('value').minute()).to.equal(30)
  })

  it('respects the precision', function() {
    this.set(
      'value',
      moment({
        h: 10,
        m: 0
      })
    )

    this.render(
      hbs`{{sy-timepicker precision=5 value=value on-change=(action (mut value))}}`
    )

    this.$('input').trigger(event('keydown', { key: 'ArrowUp', keyCode: 38 }))

    expect(this.get('value').hour()).to.equal(10)
    expect(this.get('value').minute()).to.equal(5)
  })

  it('can handle null values', async function() {
    this.set('value', moment({ h: 12, m: 30 }))

    this.render(
      hbs`{{sy-timepicker value=value on-change=(action (mut value))}}`
    )

    await fillIn('input', '')
    await blur('input')

    expect(this.get('value')).to.be.null
  })

  it('can handle null values with arrow up', function() {
    this.set('value', null)

    this.render(
      hbs`{{sy-timepicker value=value on-change=(action (mut value))}}`
    )

    this.$('input').trigger(event('keydown', { key: 'ArrowUp', keyCode: 38 }))

    expect(this.get('value').hour()).to.equal(0)
    expect(this.get('value').minute()).to.equal(15)
  })

  it('can handle null values with arrow down', function() {
    this.set('value', null)

    this.render(
      hbs`{{sy-timepicker value=value on-change=(action (mut value))}}`
    )

    this.$('input').trigger(event('keydown', { key: 'ArrowUp', keyCode: 40 }))

    expect(this.get('value').hour()).to.equal(23)
    expect(this.get('value').minute()).to.equal(45)
  })
})
