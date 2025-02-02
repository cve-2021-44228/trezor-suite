import { ArrayElement } from '@trezor/type-utils';
import { Route } from '@suite-common/suite-types';
import { routes } from '@suite-common/suite-config';
import { AccountType, NetworkSymbol } from '@suite-common/wallet-config';

import { RouteParams } from 'src/utils/suite/router';

export type SettingsBackRoute = {
    name: Route['name'];
    params?: RouteParams;
};

type RouteParamsTypes = {
    symbol: NetworkSymbol;
    accountIndex: number;
    accountType: NonNullable<AccountType>;
    cancelable: boolean;
    contractAddress?: string;
};

type ExtractType<T extends keyof RouteParamsTypes> = {
    [P in T]: RouteParamsTypes[P];
};

type AppWithParams<T extends { [key: string]: any }> = {
    [K in keyof T]: {
        app: T[K]['app'];
        route: Route;
        params: ExtractType<ArrayElement<T[K]['params']>> | undefined;
    };
};

export type RouterAppWithParams =
    | ArrayElement<AppWithParams<typeof routes>>
    | {
          app: 'unknown';
          params: undefined;
          route: undefined;
      };

export default [...routes] as Route[];
