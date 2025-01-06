import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
import { identicon } from '../../utils/identicon.ts';
import { waitForPromise } from '@ember/test-waiters';

export interface Signature {
  Element: HTMLImageElement;
  Args: {
    data: string;
    size?: number;
  };
}

export default class Identicon extends Component<Signature> {
  identiconModifier = modifier((element: HTMLImageElement) => {
    const { data, size = 60 } = this.args;
    waitForPromise(this.assignIdenticon(element, data, size));
  });

  private assignIdenticon = async (
    element: HTMLImageElement,
    data: string,
    size: number,
  ): Promise<void> => {
    const identiconBlob = await identicon(data, size);
    const url = URL.createObjectURL(identiconBlob);

    try {
      await new Promise((resolve) => {
        element.onload = resolve;
        element.src = url;
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  <template>
    <img
      alt={{@data}}
      ...attributes
      width={{@size}}
      height={{@size}}
      {{this.identiconModifier}}
    />
  </template>
}
