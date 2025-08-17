import { TokenUnitCard } from '../../../core/card/TokenCards';

export default class Spy extends TokenUnitCard {
    protected override getImplementationId() {
        return {
            id: 'spy-id',
            internalName: 'spy',
        };
    }
}
