import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Identicon', function (hooks) {
  setupRenderingTest(hooks);

  test.each('generates a square identicon', [60, 50, 40], async function (assert, size) {
    this.setProperties({ size });
    await render(hbs`
      <Identicon @size={{this.size}} @data="foobar" id="test-subject" />
    `);
    assert.dom('#test-subject')
      .hasProperty('width', size)
      .hasProperty('height', size);
  });
});
