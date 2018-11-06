import { click, fillIn, find, currentURL, visit } from '@ember/test-helpers'
import { authenticateSession } from 'ember-simple-auth/test-support'
import { beforeEach, describe, it } from 'mocha'
import { setupApplicationTest } from 'ember-mocha'
import { expect } from 'chai'
import { faker } from 'ember-cli-mirage'
import moment from 'moment'
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage'
import taskSelect from 'timed/tests/helpers/task-select'

describe('Acceptance | index reports', function() {
  let application = setupApplicationTest()
  setupMirage(application)

  beforeEach(async function() {
    let user = this.server.create('user')

    // eslint-disable-next-line camelcase
    await authenticateSession({ user_id: user.id })

    this.server.createList('report', 5, { userId: user.id })

    this.user = user
  })

  it('can visit /reports', async function() {
    await visit('/reports')

    expect(currentURL()).to.equal('/reports')
  })

  it('can list reports', async function() {
    await visit('/reports')

    // one row is for adding a new report
    expect(find('[data-test-report-row]')).to.have.length(6)
  })

  it('can add report', async function() {
    await visit('/reports')

    await taskSelect('.form-list--reports .form-list-row:last-child')

    await fillIn(
      '.form-list--reports .form-list-row:last-child [data-test-report-duration]',
      '03:30'
    )
    await fillIn(
      '.form-list--reports .form-list-row:last-child [data-test-report-comment]',
      'Test comment report'
    )

    await click(
      '.form-list--reports .form-list-row:last-child [data-test-report-review]'
    )
    await click(
      '.form-list--reports .form-list-row:last-child [data-test-report-not-billable]'
    )

    await click(
      '.form-list--reports .form-list-row:last-child [data-test-save-report]'
    )

    expect(
      find(
        '[data-test-report-row]:nth-last-child(2) [data-test-report-duration]'
      ).value
    ).to.equal('03:30')
    expect(
      find(
        '[data-test-report-row]:nth-last-child(2) [data-test-report-comment]'
      ).value
    ).to.equal('Test comment report')
  })

  it('can edit report', async function() {
    let { id } = this.server.create('report', { userId: this.user.id })

    await visit('/reports')

    expect(
      find(`${`[data-test-report-row-id="${id}"]`} [data-test-save-report]`).is(
        ':disabled'
      )
    ).to.be.ok

    await fillIn(
      `${`[data-test-report-row-id="${id}"]`} [data-test-report-duration]`,
      '00:15'
    )
    await fillIn(
      `${`[data-test-report-row-id="${id}"]`} [data-test-report-comment]`,
      'Testyy'
    )

    expect(
      find(`${`[data-test-report-row-id="${id}"]`} [data-test-save-report]`).is(
        ':disabled'
      )
    ).to.not.be.ok

    await click(
      `${`[data-test-report-row-id="${id}"]`} [data-test-save-report]`
    )

    expect(
      find(`${`[data-test-report-row-id="${id}"]`} [data-test-save-report]`).is(
        ':disabled'
      )
    ).to.be.ok

    expect(
      find(`${`[data-test-report-row-id="${id}"]`} [data-test-report-duration]`)
        .value
    ).to.equal('00:15')
    expect(
      find(`${`[data-test-report-row-id="${id}"]`} [data-test-report-comment]`)
        .value
    ).to.equal('Testyy')
  })

  it('can delete report', async function() {
    let { id } = this.server.create('report', { userId: this.user.id })

    await visit('/reports')

    expect(find(`[data-test-report-row-id="${id}"]`)).to.have.length(1)

    await click(
      `${`[data-test-report-row-id="${id}"]`} [data-test-delete-report]`
    )

    expect(find(`[data-test-report-row-id="${id}"]`)).to.have.length(0)
  })

  it('reloads absences after saving or deleting a report', async function() {
    this.server.loadFixtures('absence-types')

    let absence = this.server.create('absence', { userId: this.user.id })
    let { id } = this.server.create('report', { userId: this.user.id })

    this.server.get('/absences/:id', ({ absences }, { params: { id } }) => {
      let a = absences.find(id)

      a.comment = faker.lorem.sentence()

      return a
    })

    let { comment } = absence

    await visit('/reports')

    await click('[data-test-edit-absence]')
    expect(find('[data-test-edit-absence-form] textarea').value).to.equal(
      comment
    )
    await click('[data-test-edit-absence-form] button.close')

    await fillIn(
      `[data-test-report-row-id="${id}"] [data-test-report-comment]`,
      'test'
    )
    await click(`[data-test-report-row-id="${id}"] [data-test-save-report]`)

    await click('[data-test-edit-absence]')
    let c1 = find('[data-test-edit-absence-form] textarea').value
    await click('[data-test-edit-absence-form] button.close')

    expect(c1).to.not.equal(comment)

    await click(`[data-test-report-row-id="${id}"] [data-test-delete-report]`)

    await click('[data-test-edit-absence]')
    let c2 = find('[data-test-edit-absence-form] textarea').value
    await click('[data-test-edit-absence-form] button.close')

    expect(c2).to.not.equal(c1)
  })

  it('can reschedule reports', async function() {
    let tomorrow = moment()
      .add(1, 'days')
      .format('YYYY-MM-DD')

    await visit('/reports')
    expect(find('[data-test-report-row]')).to.have.length(6)

    await click(find('button:contains(Reschedule)'))
    await click(find(`button[data-date="${tomorrow}"]`))
    await click(find('button:contains(Save)'))

    expect(currentURL()).to.equal(`/reports?day=${tomorrow}`)
    expect(find('[data-test-report-row]')).to.have.length(6)
  })
})
