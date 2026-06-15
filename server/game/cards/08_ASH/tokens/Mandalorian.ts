import { TokenUnitCard } from '../../../core/card/TokenCards';

export default class Mandalorian extends TokenUnitCard {
    protected override getImplementationId() {
        return {
            id: '8192010342',
            internalName: 'mandalorian',
        };
    }
}
