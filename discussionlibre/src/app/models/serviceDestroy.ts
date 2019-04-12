import { Subscription } from 'rxjs';

export interface serviceDestroy {
	subscriptions: Subscription[];

	ngServiceOnDestroy(): void;
}