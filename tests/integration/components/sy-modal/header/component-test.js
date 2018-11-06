import { click, find, render } from '@ember/test-helpers'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { setupRenderingTest } from 'ember-mocha'
import hbs from 'htmlbars-inline-precompile'

describe('Integration | Component | sy modal/header', function() {
  setupRenderingTest()

  it('renders', async function() {
    this.set('visible', true)

    await render(
      hbs`{{#sy-modal/header close=(action (mut visible) false)}}Test{{/sy-modal/header}}`
    )

    expect(find('*').textContent.trim()).to.contain('Test')
    expect(find('*').textContent.trim()).to.contain('×')
  })

  it('closes on click of the close icon', async function() {
    this.set('visible', true)

    await render(
      hbs`{{#sy-modal/header close=(action (mut visible) false)}}Test{{/sy-modal/header}}`
    )

    expect(this.get('visible')).to.be.ok

    await click('button')

    expect(this.get('visible')).to.not.be.ok
  })
})
