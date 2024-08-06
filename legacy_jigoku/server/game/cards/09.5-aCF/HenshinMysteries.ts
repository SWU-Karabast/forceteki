import { EventRegistrar } from '../../EventRegistrar';
import { ProvinceCard } from '../../ProvinceCard';

export default class HenshinMysteries extends ProvinceCard {
    static id = 'henshin-mysteries';

    private eventRegistrar?: EventRegistrar;

    public setupCardAbilities() {
        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register([{ 'onClaimRing:OtherEffects': 'cancelRingClaim' }]);
    }

    public cancelRingClaim(event: any) {
        if (
            !this.isBroken &&
            !this.isBlank() &&
            event.conflict &&
            (event.conflict.getConflictProvinces() as ProvinceCard[]).some((a) => a === this) &&
            !event.cancelled
        ) {
            event.cancel();
            this.game.addMessage('{0} cancels the ring being claimed', this);
        }
    }
}
