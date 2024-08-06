import { ConflictTypes, EventNames } from '../../Constants';
import { EventRegistrar } from '../../EventRegistrar';
import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class IvoryKingdomsUnicorn extends DrawCard {
    static id = 'ivory-kingdoms-unicorn';

    private attackingAtConflictResolution = false;
    private provinceBroken = false;
    private eventRegistrar?: EventRegistrar;

    public setupCardAbilities() {
        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register([
            EventNames.AfterConflict,
            EventNames.OnBreakProvince,
            EventNames.OnConflictDeclared
        ]);

        this.reaction({
            title: 'Immediately declare a military conflict',
            when: {
                onConflictFinished: () => this.provinceBroken && this.attackingAtConflictResolution
            },
            gameAction: AbilityDsl.actions.initiateConflict({
                canPass: false,
                forcedDeclaredType: ConflictTypes.Military
            })
        });
    }

    public afterConflict() {
        this.attackingAtConflictResolution = this.isAttacking();
    }

    public onBreakProvince() {
        this.provinceBroken = true;
    }

    public onConflictDeclared() {
        this.attackingAtConflictResolution = false;
        this.provinceBroken = false;
    }
}
