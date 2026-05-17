import { TokenUnitCard } from '../../../core/card/TokenCards';

export default class Mandalorian extends TokenUnitCard {
    protected override getImplementationId() {
        return {
            id: 'mandalorian-id',
            internalName: 'mandalorian',
        };
    }
}
