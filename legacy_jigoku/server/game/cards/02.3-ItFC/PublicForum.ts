import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class PublicForum extends ProvinceCard {
    static id = 'public-forum';

    setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Prevent break and add Honor token',
            when: {
                onBreakProvince: (event, context) => event.card === context.source && !event.card.hasToken('honor')
            },
            effect: 'add an honor token to {0} instead of breaking it',
            gameAction: AbilityDsl.actions.cancel((context) => ({
                // @ts-ignore
                target: context.event,
                replacementGameAction: AbilityDsl.actions.addToken({ target: context.source })
            }))
        });
    }

    cannotBeStrongholdProvince() {
        return true;
    }
}
