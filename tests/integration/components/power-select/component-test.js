import { find, render } from '@ember/test-helpers'
import { expect } from 'chai'
import { describe, it } from 'mocha'
import { setupRenderingTest } from 'ember-mocha'
import hbs from 'htmlbars-inline-precompile'
import wait from 'ember-test-helpers/wait'
import {
  clickTrigger,
  typeInSearch
} from 'timed/tests/helpers/ember-power-select'
import { keyEvent } from 'ember-native-dom-helpers'

const OPTIONS = [
  { id: 1, name: 'Test 1' },
  { id: 2, name: 'Test 2' },
  { id: 3, name: 'Test 3' }
]

describe('Integration | Component | power select', function() {
  setupRenderingTest()

  it('can use blockless', async function() {
    this.set('options', OPTIONS)
    this.set('selected', OPTIONS[0])

    this.set('selectedTemplate', hbs`Selected: {{selected.name}}`)
    this.set('optionTemplate', hbs`Option: {{option.name}}`)

    await render(hbs`
      {{power-select
        options            = options
        selected           = selected
        onchange           = (action (mut selected))
        tagName            = 'div'
        class              = 'select'
        renderInPlace      = true
        extra              = (hash
          optionTemplate   = optionTemplate
          selectedTemplate = selectedTemplate
        )
      }}
    `)

    clickTrigger('.select')

    return wait().then(() => {
      expect(
        find('.ember-power-select-selected-item').textContent.trim()
      ).to.equal('Selected: Test 1')
      expect(
        this.$('.ember-power-select-option')
          .first()
          .text()
          .trim()
      ).to.equal('Option: Test 1')
    })
  })

  it('can select with tab', async function() {
    this.set('options', OPTIONS)
    this.set('selected', OPTIONS[0])

    this.set('selectedTemplate', hbs`Selected: {{selected.name}}`)
    this.set('optionTemplate', hbs`Option: {{option.name}}`)

    await render(hbs`
      {{power-select
        options            = options
        selected           = selected
        onchange           = (action (mut selected))
        tagName            = 'div'
        class              = 'select'
        renderInPlace      = true
        searchField        = 'name'
        extra              = (hash
          optionTemplate   = optionTemplate
          selectedTemplate = selectedTemplate
        )
      }}
    `)

    clickTrigger('.select')
    typeInSearch('2')

    keyEvent('.ember-power-select-search-input', 'keydown', 9)

    return wait().then(() => {
      expect(this.get('selected').id).to.equal(2)
    })
  })
})
