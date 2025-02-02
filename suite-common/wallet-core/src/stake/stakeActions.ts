import { createAction } from '@reduxjs/toolkit';

import { type NetworkSymbol } from '@suite-common/wallet-config';
import { StakeFormState, PrecomposedTransactionFinal } from '@suite-common/wallet-types';

export const STAKE_MODULE_PREFIX = '@common/wallet-core/stake';

type RequestSignTransactionPayload = {
    formValues: StakeFormState;
    transactionInfo: PrecomposedTransactionFinal;
};

type RequestPushTransactionPayload = {
    tx: string;
    symbol: NetworkSymbol;
};

const requestSignTransaction = createAction(
    `${STAKE_MODULE_PREFIX}/requestSignTransaction`,
    (payload?: RequestSignTransactionPayload) => ({
        payload,
    }),
);

const requestPushTransaction = createAction(
    `${STAKE_MODULE_PREFIX}/requestPushTransaction`,
    (payload?: RequestPushTransactionPayload) => ({
        payload,
    }),
);

const dispose = createAction(`${STAKE_MODULE_PREFIX}/dispose`);

export const stakeActions = {
    requestSignTransaction,
    requestPushTransaction,
    dispose,
};
