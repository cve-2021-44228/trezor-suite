import { TokenInfo } from '@trezor/connect';
import * as accountUtils from '@suite-common/wallet-utils';
import { notificationsActions } from '@suite-common/toast-notifications';
import { accountsActions, updateFiatRatesThunk } from '@suite-common/wallet-core';
import { Timestamp, TokenAddress } from '@suite-common/wallet-types';
import { FiatCurrencyCode } from '@suite-common/suite-config';

import { Dispatch } from 'src/types/suite';
import { Account } from 'src/types/wallet';

export const addToken =
    (account: Account, tokenInfo: TokenInfo[], localCurrency: FiatCurrencyCode) =>
    (dispatch: Dispatch) => {
        dispatch(
            accountsActions.updateAccount({
                ...account,
                tokens: (account.tokens || []).concat(accountUtils.enhanceTokens(tokenInfo)),
            }),
        );

        dispatch(
            updateFiatRatesThunk({
                tickers: [
                    {
                        symbol: account.symbol,
                        tokenAddress: tokenInfo[0].contract as TokenAddress,
                    },
                ],
                localCurrency,
                rateType: 'current',
                fetchAttemptTimestamp: Date.now() as Timestamp,
                forceFetchToken: true,
            }),
        );

        dispatch(
            notificationsActions.addToast({
                type: 'add-token-success',
            }),
        );
    };
